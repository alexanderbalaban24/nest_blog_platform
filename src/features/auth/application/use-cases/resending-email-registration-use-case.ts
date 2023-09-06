import { ResultDTO } from '../../../../shared/dto';
import { EmailEvents, InternalCode } from '../../../../shared/enums';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DoOperationCommand } from '../../../email/application/use-cases/do-operation-use-case';
import { v4 as uuidv4 } from 'uuid';
import add from 'date-fns/add';
import { UsersRepository } from '../../../users/infrastructure/users/users.repository';
import { EmailConfirmationRepository } from '../../../users/infrastructure/email-confirmation/email-confirmation.repository';

export class ResendingEmailRegistrationCommand {
  constructor(public email: string) {}
}

@CommandHandler(ResendingEmailRegistrationCommand)
export class ResendingEmailRegistrationUseCase
  implements ICommandHandler<ResendingEmailRegistrationCommand>
{
  constructor(
    private usersRepository: UsersRepository,
    private emailConfirmRepository: EmailConfirmationRepository,
    private commandBus: CommandBus,
  ) {}

  async execute(
    command: ResendingEmailRegistrationCommand,
  ): Promise<ResultDTO<null>> {
    const userResult = await this.usersRepository.findByCredentials(
      command.email,
    );
    if (userResult.hasError())
      return new ResultDTO(InternalCode.Internal_Server);

    const confirmDataResult = await this.emailConfirmRepository.findById(
      userResult.payload.id,
    );
    if (confirmDataResult.hasError())
      return new ResultDTO(InternalCode.Internal_Server);

    const newCode = uuidv4();
    confirmDataResult.payload.confirmationCode = newCode;
    confirmDataResult.payload.expirationDate = add(new Date(), { hours: 3 });

    await this.emailConfirmRepository.save(confirmDataResult.payload);

    return await this.commandBus.execute(
      new DoOperationCommand(EmailEvents.Registration, command.email, newCode),
    );
  }
}
