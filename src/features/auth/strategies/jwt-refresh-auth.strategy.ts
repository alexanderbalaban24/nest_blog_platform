import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Request } from 'express';
import { Inject, Injectable } from '@nestjs/common';
import { GlobalConfigService } from '../../../config/globalConfig.service';

@Injectable()
export class JwtRefreshAuthStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private GlobalConfigService: GlobalConfigService) {
    super({
      ignoreExpiration: false,
      secretOrKey: GlobalConfigService.getJwtSecret(),
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          const refreshToken = req?.cookies?.refreshToken;
          if (!refreshToken) return null;

          return refreshToken;
        },
      ]),
    });
  }

  async validate(payload: { userId: string; deviceId: string; iat: string }) {
    return { id: payload.userId, deviceId: payload.deviceId, iat: payload.iat };
  }
}
