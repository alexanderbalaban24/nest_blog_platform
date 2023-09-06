import { ResultDTO } from '../../../../shared/dto';
import { EmailEvents, InternalCode } from '../../../../shared/enums';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserCommand } from '../../../users/application/use-cases/create-user-use-case';
import { DeleteUserCommand } from '../../../users/application/use-cases/delete-user-use-case';
import { DoOperationCommand } from '../../../email/application/use-cases/do-operation-use-case';
import { UserEmailConfirmation } from '../../../users/entities/user-email-confirmation.entity';
import add from 'date-fns/add';
import { EmailConfirmationRepository } from '../../../users/infrastructure/email-confirmation/email-confirmation.repository';

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
    private commandBus: CommandBus,
    private emailConfirmRepository: EmailConfirmationRepository,
  ) {}

  async execute(command: RegistrationCommand): Promise<ResultDTO<null>> {
    const createdUserId = await this.commandBus.execute(
      new CreateUserCommand(command.login, command.email, command.password),
    );
    if (createdUserId.hasError())
      return new ResultDTO(InternalCode.Internal_Server);

    const userEmailConfirmation = new UserEmailConfirmation();
    userEmailConfirmation.expirationDate = add(new Date(), { hours: 3 });
    userEmailConfirmation.userId = createdUserId.payload.userId;

    const confirmationResult = await this.emailConfirmRepository.create(
      userEmailConfirmation,
    );

    const result = await this.commandBus.execute(
      new DoOperationCommand(
        EmailEvents.Registration,
        command.email,
        confirmationResult.payload.confirmationCode,
      ),
    );

    if (result.hasError()) {
      await this.commandBus.execute(
        new DeleteUserCommand(createdUserId.payload.userId),
      );
    }

    return result;
  }
}
