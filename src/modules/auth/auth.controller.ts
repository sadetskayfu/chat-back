import { Body, Controller, Get, HttpCode, Post, Res, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterByEmailDto } from "./dto/register-by-email.dto";
import { ApiResponse, ApiTags } from "@nestjs/swagger";
import { RegisterByEmailResponseDto } from "./dto/register-by-email-response.dto";
import { VerifyCodeDto } from "./dto/verify-code.dto";
import { CookieService } from "./cookie.service";
import { Response } from 'express';
import { VerifyCodeResponseDto } from "./dto/verify-code-response.dto";
import { LoginByEmailResponseDto } from "./dto/login-by-email-response.dto";
import { LoginByEmailDto } from "./dto/login-by-email.dto";
import { LogoutResponseDto } from "./dto/logout-response.dto";
import { AuthGuard } from "./auth.guard";
import { SessionInfoDto } from "./dto/session-info.dto";
import { SessionInfo } from "./session-info.decorator";

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService, private cookieService: CookieService){}

    @Post('register/email')
    @ApiResponse({
        status: 201,
        type: RegisterByEmailResponseDto
    })
    async registerByEmail(@Body() body: RegisterByEmailDto): Promise<RegisterByEmailResponseDto> {
        return this.authService.registerByEmail(body)
    }

    @Post('login/email')
    @HttpCode(200)
    @ApiResponse({
        status: 200,
        type: LoginByEmailResponseDto
    })
    async loginByEmail(@Body() body: LoginByEmailDto): Promise<LoginByEmailResponseDto> {
        return this.authService.loginByEmail(body)
    }

    @Post('register/verify')
    @HttpCode(200)
    @ApiResponse({
        status: 200,
        type: VerifyCodeResponseDto
    })
    async registerVerify(@Res({ passthrough: true }) res: Response, @Body() body: VerifyCodeDto): Promise<VerifyCodeResponseDto> {
        const { token } = await this.authService.verifyCode(body, true)

        this.cookieService.setToken(res, token)

        return { message: 'You have successfully created your account' }
    }

    @Post('login/verify')
    @HttpCode(200)
    @ApiResponse({
        status: 200,
        type: VerifyCodeResponseDto
    })
    async loginVerify(@Res({ passthrough: true }) res: Response, @Body() body: VerifyCodeDto): Promise<VerifyCodeResponseDto> {
        const { token } = await this.authService.verifyCode(body, false)

        this.cookieService.setToken(res, token)

        return { message: 'You have successfully logged in to your account' }
    }

    @Get('logout')
    @ApiResponse({
        status: 200,
        type: LogoutResponseDto
    })
    logout(@Res({ passthrough: true }) res: Response): LogoutResponseDto {
        this.cookieService.removeToken(res);

        return { message: 'You have successfully logged out of your' }
    }

    @Get('session')
	@ApiResponse({ status: 200, type: SessionInfoDto })
	@UseGuards(AuthGuard)
	getSessionInfo(@SessionInfo() session: SessionInfoDto) {
		return session;
	}
}