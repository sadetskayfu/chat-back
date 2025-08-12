import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DbService } from 'src/db/db.service';

@Injectable()
export class CleanupService {
	private readonly logger = new Logger(CleanupService.name);

	constructor(private db: DbService) {}

	@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
	async cleanExpiredTokens() {
		const now = new Date();

		try {
			const deleted = await this.db.refreshToken.deleteMany({
				where: { expiresAt: { lte: new Date() } },
			});
			this.logger.log(`Deleted ${deleted.count} expired refresh tokens in ${now}`);
		} catch (error) {
			this.logger.error(`Error while deleted expired refresh tokens: ${error.message}`);
		}
	}

	@Cron(CronExpression.EVERY_30_MINUTES)
	async deleteExpiredCodes() {
		const now = new Date();

		try {
			const deleted = await this.db.verificationCode.deleteMany({
				where: {
					expiresAt: { lt: now },
				},
			});
			this.logger.log(`Deleted ${deleted.count} expired/used codes in ${now}`);
		} catch (error) {
			this.logger.error(`Error while deleted expired/used codes: ${error.message}`);
		}
	}

	@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
	async deleteNotVerifiedUsers() {
		const now = new Date();

		try {
			const deletedUsers = await this.db.user.deleteMany({
				where: {
					googleId: { equals: null },
					isEmailVerified: { equals: false },
					isPhoneVerified: { equals: false },
					verificationCodes: {
						none: {
							expiresAt: { gte: now },
						},
					},
				},
			});
			this.logger.log(`Deleted ${deletedUsers.count} not verified users in ${now}`);
		} catch (error) {
			this.logger.error(`Error while deleted not verified users: ${error.message}`);
		}
	}
}
