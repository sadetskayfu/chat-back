import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import { UserService } from '../user/user.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private configService: ConfigService, private userService: UserService) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get('GOOGLE_REDIRECT_URI'),
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
    const { id: googleId, emails } = profile;
    const email = emails[0].value;

    let user = await this.userService.findByGoogleId(googleId, { id: true });
    if (!user) {
      user = await this.userService.findByEmail(email, { id: true });
      if (user) {
        await this.userService.updateGoogleId(user.id, googleId);
      } else {
        user = await this.userService.create({ email, googleId, isEmailVerified: true });
      }
    }

    done(null, user);
  }
}