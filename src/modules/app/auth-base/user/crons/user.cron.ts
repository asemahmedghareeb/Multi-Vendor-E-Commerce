import { Injectable, Logger } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class UserCron {
  constructor(private readonly userService: UserService) {}

  @Cron('0 5 * * *')
  async removeUnVerifiedUsers() {
    try {
      await this.userService.removeUnVerifiedUsers();
    } catch (err) {
      Logger.error(err);
    }
  }
}
