import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../application/auth.service';
import { Strategy } from 'passport-local';
import { CommandBus } from '@nestjs/cqrs';
import { ValidateUserCommand } from '../application/use-cases/validate-user-use-case';

@Injectable()
export class LocalAuthStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    private CommandBus: CommandBus,
  ) {
    super({
      usernameField: 'loginOrEmail',
      passwordField: 'password',
    });
  }

  async validate(loginOrEmail: string, password) {
    return true;
    const userResult = await this.CommandBus.execute(
      new ValidateUserCommand(loginOrEmail, password),
    );
    if (userResult.hasError()) throw new UnauthorizedException();

    return true;
  }
}
