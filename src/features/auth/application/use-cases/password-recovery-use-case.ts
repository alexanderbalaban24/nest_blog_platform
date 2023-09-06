import { ResultDTO } from '../../../../shared/dto';
import { EmailEvents } from '../../../../shared/enums';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DoOperationCommand } from '../../../email/application/use-cases/do-operation-use-case';
import { v4 as uuidv4 } from 'uuid';
import add from 'date-fns/add';
import { UsersRepository } from '../../../users/infrastructure/users/users.repository';
import { UserPasswordRecovery } from '../../../users/entities/user-password-recovery.entity';
import { PasswordRecoveryRepository } from '../../../users/infrastructure/password-recovery/password-recovery.repository';

export class PasswordRecoveryCommand {
  constructor(public email: string) {}
}

@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryUseCase
  implements ICommandHandler<PasswordRecoveryCommand>
{
  constructor(
    private usersRepository: UsersRepository,
    private passwordRecoveryRepository: PasswordRecoveryRepository,
    private commandBus: CommandBus,
  ) {}

  async execute(command: PasswordRecoveryCommand): Promise<ResultDTO<null>> {
    const userResult = await this.usersRepository.findByCredentials(
      command.email,
    );
    if (userResult.hasError()) return userResult as ResultDTO<null>;

    const passwordRecoveryData = new UserPasswordRecovery();
    passwordRecoveryData.expirationDate = add(new Date(), { hours: 3 });
    passwordRecoveryData.userId = userResult.payload.id;

    const confirmationCodeResult = await this.passwordRecoveryRepository.create(
      passwordRecoveryData,
    );

    return await this.commandBus.execute(
      new DoOperationCommand(
        EmailEvents.Recover_password,
        command.email,
        confirmationCodeResult.payload.confirmationCode,
      ),
    );
  }
}
