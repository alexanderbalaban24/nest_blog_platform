import { ResultDTO } from '../../../../shared/dto';
import { EmailEvents, InternalCode } from '../../../../shared/enums';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserCommand } from '../../../users/application/use-cases/create-user-use-case';
import { DeleteUserCommand } from '../../../users/application/use-cases/delete-user-use-case';
import { AuthQueryRepository } from '../../infrastructure/auth.query-repository';
import { DoOperationCommand } from '../../../email/application/use-cases/do-operation-use-case';

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
  constructor(
    private CommandBus: CommandBus,
    private AuthQueryRepository: AuthQueryRepository,
  ) {}

  async execute(command: RegistrationCommand): Promise<ResultDTO<null>> {
    const createdUserId = await this.CommandBus.execute(
      new CreateUserCommand(
        command.login,
        command.email,
        command.password,
        false,
      ),
    );
    if (createdUserId.hasError())
      return new ResultDTO(InternalCode.Internal_Server);

    const confirmationResult =
      await this.AuthQueryRepository.findUserWithConfirmationDataById(
        createdUserId.payload.userId,
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
