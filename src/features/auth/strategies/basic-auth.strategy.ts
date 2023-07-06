import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { BasicStrategy } from 'passport-http';
import { GlobalConfigService } from '../../../config/globalConfig.service';

@Injectable()
export class BasicAuthStrategy extends PassportStrategy(BasicStrategy) {
  constructor(private GlobalConfigService: GlobalConfigService) {
    super();
  }

  async validate(username: string, password: string): Promise<boolean> {
    const originalCredentials = this.GlobalConfigService.getSACredentials();
    if (
      username === originalCredentials.username &&
      password === originalCredentials.password
    ) {
      return true;
    }

    throw new UnauthorizedException();
  }
}
