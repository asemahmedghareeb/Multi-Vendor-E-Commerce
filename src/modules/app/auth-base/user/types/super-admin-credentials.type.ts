import { IsEmail, IsStrongPassword } from 'class-validator';

export class SuperAdminCredentials {
  @IsEmail()
  superAdminEmail: string;

  @IsStrongPassword()
  superAdminPassword: string;
}
