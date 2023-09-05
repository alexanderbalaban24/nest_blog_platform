import { ResultDTO } from '../../../../shared/dto';
import { AuthRepository } from '../../infrastructure/auth.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthAction } from '../../../../shared/enums';
import { EmailConfirmationRepository } from '../../../users/infrastructure/email-confirmation/email-confirmation.repository';

export class ConfirmRegistrationCommand {
  constructor(public code: string) {}
}

@CommandHandler(ConfirmRegistrationCommand)
export class ConfirmRegistrationUseCase
  implements ICommandHandler<ConfirmRegistrationCommand>
{
  constructor(
    private authRepository: AuthRepository,
    private emailConfirmationRepository: EmailConfirmationRepository,
  ) {}

  async execute(command: ConfirmRegistrationCommand): Promise<ResultDTO<null>> {
    const userResult =
      await this.emailConfirmationRepository.findByConfirmationCode(
        command.code,
      );
    if (userResult.hasError()) return userResult as ResultDTO<null>;

    const confirmDataResult = await this.emailConfirmationRepository.findById(
      userResult.payload.userId,
    );
    confirmDataResult.payload.isConfirmed = true;

    return this.emailConfirmationRepository.save(confirmDataResult.payload);
  }
}
