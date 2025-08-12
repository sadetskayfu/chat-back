import {
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { CookieService } from './cookie.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(private jwtService: JwtService) {}

	canActivate(
		context: ExecutionContext,
	): boolean | Promise<boolean> | Observable<boolean> {
		const request = context.switchToHttp().getRequest() as Request;
		const token = request.cookies[CookieService.accessTokenKey];

		if (!token) {
			throw new UnauthorizedException();
		}

		try {
			const sessionInfo = this.jwtService.verify(token, {
				secret: process.env.JWT_SECRET,
			});
			request['session'] = sessionInfo;
		} catch {
			throw new UnauthorizedException();
		}

		return true;
	}
}