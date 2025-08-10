import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from '../config/config.service';

@Injectable()
export class CookieService {
	static tokenKey = 'access-token';

    constructor(private configService: ConfigService) {}

	setToken(res: Response, token: string) {
        const ONE_DAY_MS = 24 * 60 * 60 * 1000

		res.cookie(CookieService.tokenKey, token, {
			httpOnly: true,
			sameSite: 'none',
			secure: true,
			maxAge: this.configService.get('COOKIE_EXPIRATION_DAYS', 14) * ONE_DAY_MS,
		});
	}

	removeToken(res: Response) {
		res.clearCookie(CookieService.tokenKey);
	}
}
