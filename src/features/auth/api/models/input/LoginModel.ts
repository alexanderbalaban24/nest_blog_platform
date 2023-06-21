import { IsString } from 'class-validator';

export class LoginModel {
  @IsString()
  loginOrEmail: string;
  @IsString()
  password: string;
}
