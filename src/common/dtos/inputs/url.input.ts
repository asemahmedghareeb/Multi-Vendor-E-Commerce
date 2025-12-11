import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class UrlInput {
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  url: string;
}
