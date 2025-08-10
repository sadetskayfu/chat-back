import * as nodemailer from 'nodemailer';
import * as twilio from 'twilio';
import { BadRequestException, Injectable } from '@nestjs/common';
import { pbkdf2Sync, randomBytes } from 'crypto';
import { DbService } from 'src/db/db.service';
import { ConfigService } from '../config/config.service';
import { VERIFICATION_TYPE } from 'src/shared/types/verification-type';
import { UserService } from '../user/user.service';

@Injectable()
export class VerificationService {
	private transporter: nodemailer.Transporter;
	private twilioClient: twilio.Twilio;

	constructor(
		private db: DbService,
		private configService: ConfigService,
        private userService: UserService
	) {
		this.transporter = nodemailer.createTransport({
			host: this.configService.get('SMTP_HOST'),
			port: this.configService.get('SMTP_PORT'),
			secure: false,
			auth: {
				user: this.configService.get('SMTP_USER'),
				pass: this.configService.get('SMTP_PASS'),
			},
		});

		this.twilioClient = twilio(
			this.configService.get('TWILIO_ACCOUNT_SID'),
			this.configService.get('TWILIO_AUTH_TOKEN')
		);
	}

	private getSalt() {
		return randomBytes(16).toString('hex');
	}

	private getHash(code: string, salt: string) {
		return pbkdf2Sync(code, salt, 1000, 64, 'sha512').toString('hex');
	}

	generateCode(): string {
		const length = this.configService.get<number>('VERIFICATION_CODE_LENGTH', 6);

		return randomBytes(length / 2)
			.toString('hex')
			.toUpperCase();
	}

	async verifyCode(
		userId: number,
		code: string,
		type: VERIFICATION_TYPE
	): Promise<boolean> {
		const verification = await this.db.verificationCode.findFirst({
			where: { userId, type, expiresAt: { gte: new Date() } },
			orderBy: { createdAt: 'desc' },
			select: {
				id: true,
				codeHash: true,
				codeSalt: true,
			},
		});

		if (!verification) {
			throw new BadRequestException('Code is not valid or expired');
		}

		const hash = this.getHash(code, verification.codeSalt);

		if (hash !== verification.codeHash) {
			throw new BadRequestException('Code is not valid');
		}

		await this.db.verificationCode.delete({
			where: { id: verification.id },
		});

		return true;
	}

	async saveVerificationCode(userId: number, code: string, type: VERIFICATION_TYPE) {
        await this.userService.existsById(userId)

		const salt = this.getSalt();
		const hash = this.getHash(code, salt);
		const expiresAt = new Date(
			Date.now() +
				this.configService.get<number>('VERIFICATION_CODE_EXPIRATION_MINUTES', 10) *
					60 *
					1000
		);

		await this.db.verificationCode.create({
			data: {
				userId,
				codeSalt: salt,
				codeHash: hash,
				expiresAt,
				type,
			},
            select: {}
		});
	}

	async sendEmailCode(email: string, code: string) {
		await this.transporter.sendMail({
			from: this.configService.get('SMTP_USER'),
			to: email,
			subject: 'Verification code',
			text: `Your code: ${code}`,
		});
	}

	async sendPhoneCode(phone: string, code: string) {
		await this.twilioClient.messages.create({
			body: `Your code: ${code}`,
			from: this.configService.get('TWILIO_PHONE_NUMBER'),
			to: phone,
		});
	}
}
