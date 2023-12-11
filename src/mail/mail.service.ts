import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: this.configService.get<string>('NODEMAILER_USER'),
      pass: this.configService.get<string>('NODEMAILER_PASS'),
    },
  });
  constructor(private readonly configService: ConfigService) {}

  async sendMail(to: string, subject: string, html: string): Promise<void> {
    const mailOptions = {
      from: this.configService.get<string>('NODEMAILER_USER'),
      to,
      subject,
      html,
    };

    await this.transporter.sendMail(mailOptions);
  }

  sendActivationCode(email: string, randomSixDigitNumber: number) {
    const subject = 'Your activation code';
    const html = `<div>
            <h3>Here is your activation code. Do not give it to anyone</h3>
             <h1>${randomSixDigitNumber}</h1> 
            </div>`;
    this.sendMail(email, subject, html);
  }
}
