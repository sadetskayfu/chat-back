import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { PasswordService } from './password.service';
import { VerificationModule } from '../verification/verification.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '../config/config.service';
import { CookieService } from './cookie.service';
import { AuthController } from './auth.controller';
import { ConfigModule } from '../config/config.module';

@Module({
	imports: [
        ConfigModule,
		UserModule,
		VerificationModule,
		JwtModule.registerAsync({
            imports: [ConfigModule],
			useFactory: async (config: ConfigService) => ({
				secret: config.get('JWT_SECRET'),
				signOptions: { expiresIn: `${config.get('JWT_TOKEN_EXPIRATION_DAYS', 14)}d` },
			}),
            inject: [ConfigService]
		}),
	],
	providers: [AuthService, PasswordService, CookieService],
	controllers: [AuthController],
})
export class AuthModule {}
