import { ResultDTO } from '../../../../shared/dto';
import { AuthRepository } from '../../infrastructure/auth.repository';
import { AuthQueryRepository } from '../../infrastructure/auth.query-repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class ConfirmRegistrationCommand {
  constructor(public code: string) {}
}

@CommandHandler(ConfirmRegistrationCommand)
export class ConfirmRegistrationUseCase
  implements ICommandHandler<ConfirmRegistrationCommand>
{
  constructor(
    private AuthRepository: AuthRepository,
    private AuthQueryRepository: AuthQueryRepository,
  ) {}

  async execute(command: ConfirmRegistrationCommand): Promise<ResultDTO<null>> {
    const userIdResult =
      await this.AuthQueryRepository.findUserByConfirmationCode(command.code);
    if (userIdResult.hasError()) return userIdResult as ResultDTO<null>;

    const userInstanceResult = await this.AuthRepository.findById(
      userIdResult.payload.userId,
    );
    if (userInstanceResult.hasError())
      return userInstanceResult as ResultDTO<null>;

    userInstanceResult.payload.confirmAccount();

    return this.AuthRepository.save(userInstanceResult.payload);
  }
}
