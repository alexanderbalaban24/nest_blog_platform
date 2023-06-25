import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Request } from 'express';
import { register } from 'tsconfig-paths';

export class JwtRefreshAuthStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor() {
    super({
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
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
