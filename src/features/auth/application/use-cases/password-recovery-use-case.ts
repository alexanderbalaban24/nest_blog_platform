import { ResultDTO } from '../../../../shared/dto';
import { EmailEvents } from '../../../../shared/enums';
import { AuthRepository } from '../../infrastructure/auth.repository';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DoOperationCommand } from '../../../email/application/use-cases/do-operation-use-case';
import { v4 as uuidv4 } from 'uuid';
import add from 'date-fns/add';

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

    const code = uuidv4();
    const expirationDate = add(new Date(), { hours: 3 });
    const confirmationCodeResult =
      await this.AuthRepository.createPasswordRecoveryData(
        userResult.payload.id,
        code,
        expirationDate,
      );
    if (confirmationCodeResult.hasError())
      return confirmationCodeResult as ResultDTO<null>;

    return await this.CommandBus.execute(
      new DoOperationCommand(
        EmailEvents.Recover_password,
        command.email,
        confirmationCodeResult.payload.confirmationCode,
      ),
    );
  }
}
