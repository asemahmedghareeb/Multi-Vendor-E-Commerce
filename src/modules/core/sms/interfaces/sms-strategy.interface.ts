export interface SmsStrategy {
  sendSMS(to: string, body: string): Promise<any>;
}
