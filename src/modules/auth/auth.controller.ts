import { BadRequestException, Body, Controller, Get, HttpCode, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterByEmailDto } from './dto/register-by-email.dto';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { RegisterByEmailResponseDto } from './dto/register-by-email-response.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { CookieService } from './cookie.service';
import { Request, Response } from 'express';
import { VerifyCodeResponseDto } from './dto/verify-code-response.dto';
import { LoginByEmailResponseDto } from './dto/login-by-email-response.dto';
import { LoginByEmailDto } from './dto/login-by-email.dto';
import { LogoutResponseDto } from './dto/logout-response.dto';
import { AuthGuard } from './auth.guard';
import { SessionInfoDto } from './dto/session-info.dto';
import { SessionInfo } from './session-info.decorator';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';

type User = {
    id: number
}

interface GoogleAuthRequest extends Request {
    user?: User;
  }

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
	constructor(
		private authService: AuthService,
		private cookieService: CookieService
	) {}

	@Get('google')
	@UseGuards(PassportAuthGuard('google'))
	async googleAuth(@Req() req) {}

	@Get('google/callback')
	@UseGuards(PassportAuthGuard('google'))
	async googleAuthRedirect(@Req() req: GoogleAuthRequest, @Res({ passthrough: true }) res: Response) {
        if (!req.user || !req.user.id) {
            throw new BadRequestException('Google authentication failed');
        }

		const userAgent = req.get('user-agent') || 'unknown';

		const accessToken = await this.authService.createAccessToken(req.user.id);
		const refreshToken = await this.authService.createRefreshToken(req.user.id, userAgent);

		this.cookieService.setAccessToken(res, accessToken);
		this.cookieService.setRefreshToken(res, refreshToken);

		return { message: 'You have successfully logged in to your account with google' };
	}

	@Post('register/email')
	@ApiResponse({
		status: 201,
		type: RegisterByEmailResponseDto,
	})
	async registerByEmail(@Body() body: RegisterByEmailDto): Promise<RegisterByEmailResponseDto> {
		return this.authService.registerByEmail(body);
	}

	@Post('login/email')
	@HttpCode(200)
	@ApiResponse({
		status: 200,
		type: LoginByEmailResponseDto,
	})
	async loginByEmail(@Body() body: LoginByEmailDto): Promise<LoginByEmailResponseDto> {
		return this.authService.loginByEmail(body);
	}

	@Post('register/verify')
	@HttpCode(200)
	@ApiResponse({
		status: 200,
		type: VerifyCodeResponseDto,
	})
	async registerVerify(
		@Res({ passthrough: true }) res: Response,
		@Req() req: Request,
		@Body() body: VerifyCodeDto
	): Promise<VerifyCodeResponseDto> {
		const userAgent = req.get('user-agent') || 'unknown';

		const { accessToken, refreshToken } = await this.authService.verifyCode(
			body,
			true,
			userAgent
		);

		this.cookieService.setAccessToken(res, accessToken);
		this.cookieService.setRefreshToken(res, refreshToken);

		return { message: 'You have successfully created your account' };
	}

	@Post('login/verify')
	@HttpCode(200)
	@ApiResponse({
		status: 200,
		type: VerifyCodeResponseDto,
	})
	async loginVerify(
		@Res({ passthrough: true }) res: Response,
		@Req() req: Request,
		@Body() body: VerifyCodeDto
	): Promise<VerifyCodeResponseDto> {
		const userAgent = req.get('user-agent') || 'unknown';

		const { accessToken, refreshToken } = await this.authService.verifyCode(
			body,
			false,
			userAgent
		);

		this.cookieService.setAccessToken(res, accessToken);
		this.cookieService.setRefreshToken(res, refreshToken);

		return { message: 'You have successfully logged in to your account' };
	}

	@Get('logout')
	@UseGuards(AuthGuard)
	@ApiResponse({
		status: 200,
		type: LogoutResponseDto,
	})
	async logout(
		@SessionInfo() session: SessionInfoDto,
		@Res({ passthrough: true }) res: Response,
		@Req() req: Request
	): Promise<LogoutResponseDto> {
		const userAgent = req.get('user-agent') || 'unknown';

		this.cookieService.removeTokens(res);
		await this.authService.deleteRefreshTokens(session.id, userAgent);

		return { message: 'You have successfully logged out of your account' };
	}

    @Get('logout/all')
	@UseGuards(AuthGuard)
	@ApiResponse({
		status: 200,
		type: LogoutResponseDto,
	})
	async logoutOnAllDevice(
		@SessionInfo() session: SessionInfoDto,
		@Res({ passthrough: true }) res: Response,
	): Promise<LogoutResponseDto> {
		this.cookieService.removeTokens(res);
		await this.authService.deleteAllRefreshTokens(session.id);

		return { message: 'You have successfully logged out on all accounts' };
	}

	@Get('session')
	@UseGuards(AuthGuard)
    @ApiResponse({
		status: 200,
		type: SessionInfoDto,
	})
	getSessionInfo(
		@SessionInfo() session: SessionInfoDto,
	): SessionInfoDto {
		return session;
	}

	@Get('refresh')
    @ApiResponse({
		status: 200,
	})
	async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
		const userAgent = req.get('user-agent') || 'unknown';

		const refreshToken = req.cookies[CookieService.refreshTokenKey];

		const accessTokens = await this.authService.refreshSession(refreshToken, userAgent);

		this.cookieService.setAccessToken(res, accessTokens);

		return { ok: true };
	}
}
