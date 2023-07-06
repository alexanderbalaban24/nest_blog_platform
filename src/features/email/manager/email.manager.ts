import { EmailAdapter } from '../adapter/email.adapter';
import { Injectable } from '@nestjs/common';
import { ResultDTO } from '../../../shared/dto';
import { InternalCode } from '../../../shared/enums';

@Injectable()
export class EmailManager {
  constructor(private emailAdapter: EmailAdapter) {}

  async sendEmailRegistrationMessage(
    email: string,
    confirmationCode: string,
  ): Promise<ResultDTO<null>> {
    const message =
      '<h1>Thank for your registration</h1>' +
      '<p>To finish registration please follow the link below:' +
      `<a href="https://somesite.com/confirm-email?code=${confirmationCode}">complete registration</a>` +
      '</p>';

    const subject = 'Registration Confirmation';

    const isSending = await this.emailAdapter.sendEmail(
      email,
      subject,
      message,
    );
    if (!isSending) return new ResultDTO(InternalCode.Internal_Server);

    return new ResultDTO(InternalCode.Success);
  }

  async sendEmailRecoverPasswordMessage(
    email: string,
    recoverCode: string,
  ): Promise<ResultDTO<null>> {
    const message =
      '<h1>Password recovery</h1>\n' +
      '       <p>To finish password recovery please follow the link below:\n' +
      `          <a href="https://somesite.com/password-recovery?recoveryCode=${recoverCode}">recovery password</a>\n` +
      '      </p>';

    const subject = 'Password recover';

    const isSending = await this.emailAdapter.sendEmail(
      email,
      subject,
      message,
    );
    if (!isSending) return new ResultDTO(InternalCode.Internal_Server);

    return new ResultDTO(InternalCode.Success);
  }
}
