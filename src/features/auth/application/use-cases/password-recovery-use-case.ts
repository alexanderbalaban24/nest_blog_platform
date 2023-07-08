import { ResultDTO } from '../../../../shared/dto';
import { EmailEvents } from '../../../../shared/enums';
import { AuthRepository } from '../../infrastructure/auth.repository';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DoOperationCommand } from '../../../email/application/use-cases/do-operation-use-case';

export class PasswordRecoveryCommand {
  constructor(public email: string) {}
}

@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryUseCase
  implements ICommandHandler<PasswordRecoveryCommand>
{
  constructor(
    private AuthRepository: AuthRepository,
    private CommandBus: CommandBus,
  ) {}

  async execute(command: PasswordRecoveryCommand): Promise<ResultDTO<null>> {
    const userResult = await this.AuthRepository.findByCredentials(
      command.email,
    );
    if (userResult.hasError()) return userResult as ResultDTO<null>;

    const confirmationCode =
      userResult.payload.updateConfirmationOrRecoveryData('passwordRecovery');
    const savedResult = await this.AuthRepository.save(userResult.payload);
    if (savedResult.hasError()) return savedResult;

    return await this.CommandBus.execute(
      new DoOperationCommand(
        EmailEvents.Recover_password,
        command.email,
        confirmationCode,
      ),
    );
  }
}
