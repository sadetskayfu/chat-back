import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from '../config/config.service';

@Injectable()
export class CookieService {
	static accessTokenKey = 'access-token';
    static refreshTokenKey = 'refresh-token';

    constructor(private configService: ConfigService) {}

	setAccessToken(res: Response, token: string) {
		res.cookie(CookieService.accessTokenKey, token, {
			httpOnly: true,
			sameSite: 'none',
			secure: true,
			maxAge: this.configService.get('JWT_ACCESS_EXPIRATION_MINUTES') * 60 * 1000
		});
	}

    setRefreshToken(res: Response, token: string) {
        const ONE_DAY_MS = 24 * 60 * 60 * 1000

        res.cookie(CookieService.refreshTokenKey, token, {
			httpOnly: true,
			sameSite: 'none',
			secure: true,
			maxAge: this.configService.get('JWT_REFRESH_EXPIRATION_DAY') * ONE_DAY_MS
		});
    }

	removeTokens(res: Response) {
        res.clearCookie(CookieService.accessTokenKey);
        res.clearCookie(CookieService.refreshTokenKey);
	}
}
