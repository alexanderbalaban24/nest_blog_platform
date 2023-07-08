import { ResultDTO } from '../../../../shared/dto';
import { sub } from 'date-fns';
import { RateLimitRepository } from '../../infrastructure/rateLimit.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class GetCountAttemptsCommand {
  constructor(public ip: string, public url: string) {}
}

@CommandHandler(GetCountAttemptsCommand)
export class GetCountAttemptsUseCase
  implements ICommandHandler<GetCountAttemptsCommand>
{
  constructor(private RateLimitRepository: RateLimitRepository) {}

  async execute(
    command: GetCountAttemptsCommand,
  ): Promise<ResultDTO<{ count: number }>> {
    const limitInterval = sub(new Date(), { seconds: 10 });

    return this.RateLimitRepository.getCountAttemptsByIPAndUrl(
      command.ip,
      command.url,
      limitInterval,
    );
  }
}
