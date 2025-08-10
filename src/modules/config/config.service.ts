import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

interface Config {
	JWT_SECRET: string;
	SMTP_HOST: string;
	SMTP_PORT: number;
	SMTP_USER: string;
	SMTP_PASS: string;
	TWILIO_ACCOUNT_SID: string;
	TWILIO_AUTH_TOKEN: string;
	TWILIO_PHONE_NUMBER: string;
	DEVICE_EXPIRATION_DAYS: number;
	VERIFICATION_CODE_EXPIRATION_MINUTES: number;
	VERIFICATION_CODE_LENGTH: number;
    COOKIE_EXPIRATION_DAYS: number
    JWT_TOKEN_EXPIRATION_DAYS: number
}

@Injectable()
export class ConfigService extends NestConfigService<Config> {}
