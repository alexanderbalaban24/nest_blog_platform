import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Inject, Injectable } from '@nestjs/common';
import { GlobalConfigService } from '../../../config/globalConfig.service';

@Injectable()
export class JwtAccessAuthStrategy extends PassportStrategy(
  Strategy,
  'jwt-access',
) {
  constructor(private GlobalConfigService: GlobalConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: GlobalConfigService.getJwtSecret(),
    });
  }

  async validate(payload: any) {
    return { id: payload.userId };
  }
}
