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
import { VERIFICATION_TYPE } from 'src/shared/types/verification-type';

@Injectable()
export class AuthService {
	constructor(
        private db: DbService,
		private configService: ConfigService,
		private userService: UserService,
		private passwordService: PasswordService,
		private verificationService: VerificationService,
		private jwtService: JwtService
	) {
    }

    async createAccessToken(userId: number) {
        const accessToken = await this.jwtService.signAsync({ id: userId }, {
			expiresIn: `${this.configService.get('JWT_ACCESS_EXPIRATION_MINUTES')}m`
		});

        return accessToken
    }

    async createRefreshToken(userId: number, userAgent: string) {
		const refreshToken = await this.jwtService.signAsync({ id: userId }, {
			expiresIn: `${this.configService.get('JWT_REFRESH_EXPIRATION_DAY')}d`
		});

        const expiresAt = new Date(
			Date.now() +
				this.configService.get<number>('JWT_REFRESH_EXPIRATION_DAY') * 24 * 60 *
					60 *
					1000
		);

        await this.db.refreshToken.create({
            data: { userId, token: refreshToken, userAgent, expiresAt },
            select: {}
        });

        return refreshToken
    }

    async deleteRefreshTokens(userId: number, userAgent: string) {
        await this.db.refreshToken.deleteMany({ where: { userId, userAgent } })
    }

    async deleteAllRefreshTokens(userId: number) {
        await this.db.refreshToken.deleteMany({ where: { userId } })
    }

    async refreshSession(refreshToken: string, userAgent: string) {
        try {
            const payload = await this.jwtService.verifyAsync(refreshToken);
            const stored = await this.db.refreshToken.findFirst({
                where: { userId: payload.id, token: refreshToken, userAgent, expiresAt: { gte: new Date() } },
                orderBy: { createdAt: 'desc' }
            });
    
            if (!stored) {
                throw new BadRequestException('Invalid refresh token');
            }
    
            return await this.createAccessToken(payload.id);
        } catch {
            throw new BadRequestException('Invalid refresh token');
        }
    }

	private async sendVerificationCode(userId: number, type: VERIFICATION_TYPE, target: string) {
		const code = this.verificationService.generateCode();
		await this.verificationService.saveVerificationCode(userId, code, type);

		if (type === 'EMAIL') {
			await this.verificationService.sendEmailCode(target, code);
		} else {
			await this.verificationService.sendPhoneCode(target, code);
		}
	}

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

        await this.sendVerificationCode(user.id, 'EMAIL', email)

		return {
			userId: user.id,
            email,
			message: 'Code has been sent to your email address',
			verificationCodeExpirationMinutes: this.configService.get(
				'VERIFICATION_CODE_EXPIRATION_MINUTES'
			),
		};
	}

	async loginByEmail({ email, password }: LoginByEmailDto): Promise<LoginByEmailResponseDto> {
		const user = await this.userService.findByEmail(email, { id: true, passwordHash: true, passwordSalt: true });

		if (!user) {
			throw new BadRequestException('Incorrect email or password');
		}

		const hash = this.passwordService.getHash(password, user.passwordSalt);

		if (hash !== user.passwordHash) {
			throw new BadRequestException('Incorrect email or password');
		}

        await this.sendVerificationCode(user.id, 'EMAIL', email);

		return {
			userId: user.id,
			message: 'Code has been sent to your email address',
			verificationCodeExpirationMinutes: this.configService.get(
				'VERIFICATION_CODE_EXPIRATION_MINUTES'
			),
		};
	}

	async verifyCode({ userId, code, type }: VerifyCodeDto, isFirstVerify: boolean, userAgent: string) {
		await this.verificationService.verifyCode(userId, code, type);

		if (isFirstVerify) {
			if (type === 'EMAIL') await this.userService.setEmailVerified(userId);
			if (type === 'PHONE') await this.userService.setPhoneVerified(userId);
		}

		const accessToken = await this.createAccessToken(userId);
        const refreshToken = await this.createRefreshToken(userId, userAgent)

		return { accessToken, refreshToken }
	}
}
