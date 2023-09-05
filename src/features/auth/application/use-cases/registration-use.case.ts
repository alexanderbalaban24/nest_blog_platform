import { ResultDTO } from '../../../../shared/dto';
import { EmailEvents, InternalCode } from '../../../../shared/enums';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserCommand } from '../../../users/application/use-cases/create-user-use-case';
import { DeleteUserCommand } from '../../../users/application/use-cases/delete-user-use-case';
import { DoOperationCommand } from '../../../email/application/use-cases/do-operation-use-case';
import { CreateUserEmailConfirmationCommand } from '../../../users/application/use-cases/create-user-email-confirmation-use-case';

export class RegistrationCommand {
  constructor(
    public login: string,
    public email: string,
    public password: string,
  ) {}
}

@CommandHandler(RegistrationCommand)
export class RegistrationUseCase
  implements ICommandHandler<RegistrationCommand>
{
  constructor(private CommandBus: CommandBus) {}

  async execute(command: RegistrationCommand): Promise<ResultDTO<null>> {
    const createdUserId = await this.CommandBus.execute(
      new CreateUserCommand(command.login, command.email, command.password),
    );
    if (createdUserId.hasError())
      return new ResultDTO(InternalCode.Internal_Server);

    const confirmationResult = await this.CommandBus.execute(
      new CreateUserEmailConfirmationCommand(createdUserId.payload.userId),
    );

    const result = await this.CommandBus.execute(
      new DoOperationCommand(
        EmailEvents.Registration,
        command.email,
        confirmationResult.payload.confirmationCode,
      ),
    );

    if (result.hasError()) {
      await this.CommandBus.execute(
        new DeleteUserCommand(createdUserId.payload.userId),
      );
    }

    return result;
  }
}
