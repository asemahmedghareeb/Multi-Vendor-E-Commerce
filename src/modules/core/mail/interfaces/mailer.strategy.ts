import { Mail } from '../types/mail.type';

export interface MailerStrategy {
  sendEmail(mailOptions: Mail): Promise<any>;
}
