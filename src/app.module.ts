import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { VerificationModule } from './modules/verification/verification.module';
import { CleanupModule } from './modules/cleanup/cleanup.module';
import { ConfigModule } from './modules/config/config.module';

@Module({
	imports: [ConfigModule, AuthModule, UserModule, VerificationModule, CleanupModule],
})
export class AppModule {}
