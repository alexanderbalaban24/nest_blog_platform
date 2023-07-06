import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { RateLimitService } from '../application/rateLimit.service';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(private RateLimitServices: RateLimitService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { ip, originalUrl } = request;

    await this.RateLimitServices.addAttempt(ip, originalUrl);

    const attemptsCountResult = await this.RateLimitServices.getCountAttempts(
      ip,
      originalUrl,
    );

    if (attemptsCountResult.payload.count <= 5) {
      return true;
    } else {
      throw new HttpException(response, HttpStatus.TOO_MANY_REQUESTS);
    }
  }
}
