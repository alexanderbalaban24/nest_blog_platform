import { ResultDTO } from '../../../../shared/dto';
import { AuthAction, EmailEvents } from '../../../../shared/enums';
import { AuthRepository } from '../../infrastructure/auth.repository';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DoOperationCommand } from '../../../email/application/use-cases/do-operation-use-case';
import { v4 as uuidv4 } from 'uuid';
import add from 'date-fns/add';

export class ResendingEmailRegistrationCommand {
  constructor(public email: string) {}
}

@CommandHandler(ResendingEmailRegistrationCommand)
export class ResendingEmailRegistrationUseCase
  implements ICommandHandler<ResendingEmailRegistrationCommand>
{
  constructor(
    private AuthRepository: AuthRepository,
    private CommandBus: CommandBus,
  ) {}

  async execute(
    command: ResendingEmailRegistrationCommand,
  ): Promise<ResultDTO<null>> {
    const newCode = uuidv4();
    const newExpirationDate = add(new Date(), { hours: 3 });

    const updatedResult =
      await this.AuthRepository.updateConfirmationOrRecoveryData(
        command.email,
        newCode,
        newExpirationDate,
        AuthAction.Confirmation,
      );

    if (updatedResult.hasError()) return updatedResult as ResultDTO<null>;

    return await this.CommandBus.execute(
      new DoOperationCommand(
        EmailEvents.Registration,
        command.email,
        updatedResult.payload.confirmationCode,
      ),
    );
  }
}
