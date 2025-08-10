import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { DbService } from 'src/db/db.service';

@Injectable()
export class UserService {
	constructor(
		private db: DbService,
		private configService: ConfigService
	) {}

	async existsById(id: number) {
		const user = await this.db.user.findUnique({ where: { id }, select: { id: true } });

		if (!user) {
			throw new NotFoundException('User not found');
		}

		return true;
	}

	async findByEmail<S extends Prisma.UserSelect>(
		email: string,
		select: S
	) {
		const user = await this.db.user.findUnique({ where: { email }, select });

		return user;
	}

	async findByGoogleId<S extends Prisma.UserSelect>(
		googleId: string,
		select: S
	) {
		const user = await this.db.user.findUnique({ where: { googleId }, select });

		return user;
	}

	async setEmailVerified(userId: number) {
		await this.db.user.update({
			where: {
				id: userId,
			},
			data: {
				isEmailVerified: true,
			},
            select: {}
		});
	}

	async setPhoneVerified(userId: number) {
		await this.db.user.update({
			where: {
				id: userId,
			},
			data: {
				isPhoneVerified: true,
			},
            select: {}
		});
	}

    async updateGoogleId(userId: number, googleId: string) {
		const updatedUser = await this.db.user.update({
			where: {
				id: userId,
			},
			data: {
				googleId
			},
            select: {
                id: true,
            }
		});

        return updatedUser
    }

	async create(data: {
		passwordSalt?: string;
		passwordHash?: string;
		phone?: string;
		email?: string;
        googleId?: string
        isEmailVerified?: boolean
	}) {
		if (!data.email && !data.phone && !data.googleId) {
			throw new BadRequestException('Email, phone or googleId is required');
		}

		const user = await this.db.user.create({
			data,
			select: {
				id: true,
			},
		});

		return user;
	}

	async deleteByEmail(email: string) {
		await this.db.user.delete({ where: { email } });
	}
}
