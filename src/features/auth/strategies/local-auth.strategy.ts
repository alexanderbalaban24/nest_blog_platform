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
    const isValidUser = await this.authService.validateUser(
      loginOrEmail,
      password,
    );
    console.log(isValidUser);
    if (!isValidUser) throw new UnauthorizedException();

    return isValidUser;
  }
}
