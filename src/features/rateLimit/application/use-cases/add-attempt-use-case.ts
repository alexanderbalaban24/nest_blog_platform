import { InjectModel } from '@nestjs/mongoose';
import { RateLimit, RateLimitModelType } from '../../domain/rateLimit.entity';
import { ResultDTO } from '../../../../shared/dto';
import { RateLimitRepository } from '../../infrastructure/rateLimit.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class AddAttemptCommand {
  constructor(public ip: string, public url: string) {}
}

@CommandHandler(AddAttemptCommand)
export class AddAttemptUseCase implements ICommandHandler<AddAttemptCommand> {
  constructor(
    @InjectModel(RateLimit.name) private RateLimitModel: RateLimitModelType,
    private RateLimitRepository: RateLimitRepository,
  ) {}

  async execute(command: AddAttemptCommand): Promise<ResultDTO<null>> {
    const newAttempt = this.RateLimitModel.makeInstance(
      command.ip,
      command.url,
      this.RateLimitModel,
    );

    return this.RateLimitRepository.save(newAttempt);
  }
}
