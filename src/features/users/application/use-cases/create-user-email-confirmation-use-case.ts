import { ResultDTO } from '../../../../shared/dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import add from 'date-fns/add';
import { UserEmailConfirmation } from '../../entities/user-email-confirmation.entity';
import { EmailConfirmationRepository } from '../../infrastructure/email-confirmation/email-confirmation.repository';

export class CreateUserEmailConfirmationCommand {
  constructor(public userId: string) {}
}

@CommandHandler(CreateUserEmailConfirmationCommand)
export class CreateUserEmailConfirmationUseCase
  implements ICommandHandler<CreateUserEmailConfirmationCommand>
{
  constructor(private emailConfirmRepository: EmailConfirmationRepository) {}

  async execute(
    command: CreateUserEmailConfirmationCommand,
  ): Promise<ResultDTO<{ confirmationCode: string }>> {
    const userEmailConfirmation = new UserEmailConfirmation();
    userEmailConfirmation.expirationDate = add(new Date(), { hours: 3 });
    userEmailConfirmation.userId = +command.userId;

    return this.emailConfirmRepository.create(userEmailConfirmation);
  }
}
