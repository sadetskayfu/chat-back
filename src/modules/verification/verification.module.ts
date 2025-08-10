import { Module } from '@nestjs/common';
import { DbModule } from 'src/db/db.module';
import { VerificationService } from './verification.service';
import { ConfigModule } from '../config/config.module';
import { UserModule } from '../user/user.module';

@Module({
	imports: [DbModule, ConfigModule, UserModule],
    providers: [VerificationService],
    exports: [VerificationService],
})
export class VerificationModule {}
