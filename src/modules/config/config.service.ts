import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

interface Config {
	SMTP_HOST: string;
	SMTP_PORT: number;
	SMTP_USER: string;
	SMTP_PASS: string;

	TWILIO_ACCOUNT_SID: string;
	TWILIO_AUTH_TOKEN: string;
	TWILIO_PHONE_NUMBER: string;

	VERIFICATION_CODE_EXPIRATION_MINUTES: number;
	VERIFICATION_CODE_LENGTH: number;

    JWT_SECRET: string;
	JWT_ACCESS_EXPIRATION_MINUTES: number;
	JWT_REFRESH_EXPIRATION_DAY: number;

	GOOGLE_CLIENT_ID: string;
	GOOGLE_CLIENT_SECRET: string;
	GOOGLE_REDIRECT_URI: string;
}

@Injectable()
export class ConfigService extends NestConfigService<Config> {}
