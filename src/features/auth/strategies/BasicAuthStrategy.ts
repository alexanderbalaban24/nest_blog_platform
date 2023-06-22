import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { BasicStrategy } from 'passport-http';

@Injectable()
export class BasicAuthStrategy extends PassportStrategy(BasicStrategy) {
  constructor() {
    super();
  }

  async validate(username: string, password: string): Promise<boolean> {
    if (
      username === process.env.SA_USERNAME &&
      password === process.env.SA_PASSWORD
    ) {
      return true;
    }

    throw new UnauthorizedException();
  }
}
