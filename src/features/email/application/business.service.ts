import { EmailManager } from '../manager/email.manager';
import { Injectable } from '@nestjs/common';
import { EmailEvents } from '../../../shared/enums';

@Injectable()
export class BusinessService {
  constructor(private emailManager: EmailManager) {}

  async doOperation(
    event: EmailEvents,
    email: string,
    code: string,
  ): Promise<boolean> {
    let isSending: boolean;
    switch (event) {
      case EmailEvents.Registration:
        isSending = await this.emailManager.sendEmailRegistrationMessage(
          email,
          code,
        );
        break;
      case EmailEvents.Recover_password:
        isSending = await this.emailManager.sendEmailRecoverPasswordMessage(
          email,
          code,
        );
        break;
      default:
        isSending = false;
        break;
    }

    return isSending;
  }
}
