import nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';
import { GlobalConfigService } from '../../../config/globalConfig.service';

@Injectable()
export class EmailAdapter {
  constructor(private GlobalConfigService: GlobalConfigService) {}

  async sendEmail(
    email: string,
    subject: string,
    message: string,
  ): Promise<boolean> {
    const { gmail, password } = this.GlobalConfigService.getSAGmail();

    const transport = await nodemailer.createTransport({
      port: 465,
      host: 'smtp.gmail.com',
      auth: {
        user: gmail,
        pass: password,
      },
    });

    return new Promise((resolve, reject) => {
      transport.sendMail(
        {
          from: `"Alex" <${gmail}>`,
          to: email,
          subject: subject,
          html: message,
        },
        (err, info) => {
          if (err) {
            console.error(err);
            reject(false);
          } else {
            resolve(true);
          }
        },
      );
    });
  }
}
