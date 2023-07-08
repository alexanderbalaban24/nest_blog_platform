import { EmailManager } from '../../manager/email.manager';
import { EmailEvents, InternalCode } from '../../../../shared/enums';
import { ResultDTO } from '../../../../shared/dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class DoOperationCommand {
  constructor(
    public event: EmailEvents,
    public email: string,
    public code: string,
  ) {}
}

@CommandHandler(DoOperationCommand)
export class DoOperationUseCase implements ICommandHandler<DoOperationCommand> {
  constructor(private emailManager: EmailManager) {}

  async execute(command: DoOperationCommand): Promise<ResultDTO<null>> {
    let sendResult: ResultDTO<null>;
    switch (command.event) {
      case EmailEvents.Registration:
        sendResult = await this.emailManager.sendEmailRegistrationMessage(
          command.email,
          command.code,
        );
        break;
      case EmailEvents.Recover_password:
        sendResult = await this.emailManager.sendEmailRecoverPasswordMessage(
          command.email,
          command.code,
        );
        break;
      default:
        sendResult = new ResultDTO(InternalCode.Internal_Server);
        break;
    }

    return sendResult;
  }
}
