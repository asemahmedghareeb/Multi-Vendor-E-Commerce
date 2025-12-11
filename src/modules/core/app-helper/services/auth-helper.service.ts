import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthHelperService {
  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 12);
  }
}
