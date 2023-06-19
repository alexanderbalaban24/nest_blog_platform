import nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailAdapter {
  async sendEmail(
    email: string,
    subject: string,
    message: string,
  ): Promise<boolean> {
    const gmail = process.env.GMAIL;
    const pass = process.env.GMAIL_PASS;

    const transport = await nodemailer.createTransport({
      port: 465,
      host: 'smtp.gmail.com',
      auth: {
        user: gmail,
        pass: pass,
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
