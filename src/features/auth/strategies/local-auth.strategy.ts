import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../application/auth.service';
import { Strategy } from 'passport-local';

@Injectable()
export class LocalAuthStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'loginOrEmail',
      passwordField: 'password',
    });
  }

  async validate(loginOrEmail: string, password) {
    return true;
    const userResult = await this.authService.validateUser(
      loginOrEmail,
      password,
    );
    if (userResult.hasError()) throw new UnauthorizedException();

    return true;
  }
}
