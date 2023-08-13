import { ResultDTO } from '../../../../shared/dto';
import { AuthRepository } from '../../infrastructure/auth.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthAction } from '../../../../shared/enums';

export class ConfirmRegistrationCommand {
  constructor(public code: string) {}
}

@CommandHandler(ConfirmRegistrationCommand)
export class ConfirmRegistrationUseCase
  implements ICommandHandler<ConfirmRegistrationCommand>
{
  constructor(private AuthRepository: AuthRepository) {}

  async execute(command: ConfirmRegistrationCommand): Promise<ResultDTO<null>> {
    const userResult = await this.AuthRepository.findByConfirmationCode(
      command.code,
      AuthAction.Confirmation,
    );
    if (userResult.hasError()) return userResult as ResultDTO<null>;

    return this.AuthRepository.confirmEmail(userResult.payload.userId);
  }
}
