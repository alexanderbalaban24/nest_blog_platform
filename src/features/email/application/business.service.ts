import { EmailManager } from '../manager/email.manager';
import { Injectable } from '@nestjs/common';
import { EmailEvents, InternalCode } from '../../../shared/enums';
import { ResultDTO } from '../../../shared/dto';

@Injectable()
export class BusinessService {
  constructor(private emailManager: EmailManager) {}

  async doOperation(
    event: EmailEvents,
    email: string,
    code: string,
  ): Promise<ResultDTO<null>> {
    let sendResult: ResultDTO<null>;
    switch (event) {
      case EmailEvents.Registration:
        sendResult = await this.emailManager.sendEmailRegistrationMessage(
          email,
          code,
        );
        break;
      case EmailEvents.Recover_password:
        sendResult = await this.emailManager.sendEmailRecoverPasswordMessage(
          email,
          code,
        );
        break;
      default:
        sendResult = new ResultDTO(InternalCode.Internal_Server);
        break;
    }

    return sendResult;
  }
}
