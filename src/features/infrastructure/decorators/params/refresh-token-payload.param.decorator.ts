import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RefreshTokenPayloadType } from './types';

export const RefreshTokenPayload = createParamDecorator(
  (data: unknown, context: ExecutionContext): RefreshTokenPayloadType => {
    const request = context.switchToHttp().getRequest();
    if (request.user) {
      return {
        deviceId: request.user.deviceId,
        iat: request.user.iat,
      } as RefreshTokenPayloadType;
    }
  },
);
