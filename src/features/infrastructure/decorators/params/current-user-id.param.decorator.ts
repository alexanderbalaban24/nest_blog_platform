import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import * as process from 'process';

export const CurrentUserId = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    if (request.user?.id) return request.user.id;

    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    if (type === 'Bearer') {
      const decodedData = new JwtService().decode(token);
      return (decodedData as { userId: string }).userId;
    }
  },
);
