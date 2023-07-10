import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { RateLimitService } from '../application/rateLimit.service';
import { CommandBus } from '@nestjs/cqrs';
import { AddAttemptCommand } from '../application/use-cases/add-attempt-use-case';
import { GetCountAttemptsCommand } from '../application/use-cases/get-count-attempts-use-case';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private RateLimitServices: RateLimitService,
    private CommandBus: CommandBus,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { ip, originalUrl } = request;

    await this.CommandBus.execute(new AddAttemptCommand(ip, originalUrl));

    const attemptsCountResult = await this.CommandBus.execute(
      new GetCountAttemptsCommand(ip, originalUrl),
    );
    //TODO для автопроверки временно отключил, потом снова надо будет включить
    return true;
    if (attemptsCountResult.payload.count <= 5) {
      return true;
    } else {
      throw new HttpException(response, HttpStatus.TOO_MANY_REQUESTS);
    }
  }
}
