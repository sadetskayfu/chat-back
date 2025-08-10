import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DbService } from 'src/db/db.service';
import { UserService } from '../user/user.service';
import { PasswordService } from './password.service';
import { VerificationService } from '../verification/verification.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterByEmailResponseDto } from './dto/register-by-email-response.dto';
import { ConfigService } from '../config/config.service';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { RegisterByEmailDto } from './dto/register-by-email.dto';
import { LoginByEmailDto } from './dto/login-by-email.dto';
import { LoginByEmailResponseDto } from './dto/login-by-email-response.dto';

@Injectable()
export class AuthService {
	constructor(
		private configService: ConfigService,
		private userService: UserService,
		private passwordService: PasswordService,
		private verificationService: VerificationService,
		private jwtService: JwtService
	) {}

	async registerByEmail({
		email,
		password,
	}: RegisterByEmailDto): Promise<RegisterByEmailResponseDto> {
		const existedUser = await this.userService.findByEmail(email, {
			id: true,
			googleId: true,
			isEmailVerified: true,
			isPhoneVerified: true,
		});

		if (
			existedUser &&
			(existedUser.googleId || existedUser.isEmailVerified || existedUser.isPhoneVerified)
		) {
			throw new BadRequestException('Email is already in use');
		}

		if (existedUser) {
			await this.userService.deleteByEmail(email);
		}

		const passwordSalt = this.passwordService.getSalt();
		const passwordHash = this.passwordService.getHash(password, passwordSalt);

		const user = await this.userService.create({ passwordSalt, passwordHash, email });

		const code = this.verificationService.generateCode();

		await this.verificationService.saveVerificationCode(user.id, code, 'EMAIL');
		await this.verificationService.sendEmailCode(email, code);

		return {
			userId: user.id,
			message: 'Code has been sent to your email address',
			verificationCodeExpirationMinutes: this.configService.get(
				'VERIFICATION_CODE_EXPIRATION_MINUTES'
			),
		};
	}

	async loginByEmail({ email, password }: LoginByEmailDto): Promise<LoginByEmailResponseDto> {
		const existsUser = await this.userService.findByEmail(email, { id: true, passwordHash: true, passwordSalt: true });

		if (!existsUser) {
			throw new BadRequestException('Incorrect email or password');
		}

		const hash = this.passwordService.getHash(password, existsUser.passwordSalt);

		if (hash !== existsUser.passwordHash) {
			throw new BadRequestException('Incorrect email or password');
		}

		const code = this.verificationService.generateCode();

		await this.verificationService.saveVerificationCode(existsUser.id, code, 'EMAIL');
		await this.verificationService.sendEmailCode(email, code);

		return {
			userId: existsUser.id,
			message: 'Code has been sent to your email address',
			verificationCodeExpirationMinutes: this.configService.get(
				'VERIFICATION_CODE_EXPIRATION_MINUTES'
			),
		};
	}

	async verifyCode({ userId, code, type }: VerifyCodeDto, isFirstVerify: boolean = false) {
		await this.verificationService.verifyCode(userId, code, type);

		if (isFirstVerify && type === 'EMAIL') {
			await this.userService.setEmailVerified(userId);
		}

		if (isFirstVerify && type === 'PHONE') {
			await this.userService.setPhoneVerified(userId);
		}

		const token = await this.jwtService.signAsync({
			id: userId,
		});

		return { token };
	}
}
