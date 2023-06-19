import { IsString } from 'class-validator';

export class CreateUserModel {
  @IsString()
  login: string;
  @IsString()
  email: string;
  @IsString()
  password: string;
}
