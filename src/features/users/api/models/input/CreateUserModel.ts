import { IsString, Length } from 'class-validator';

export class CreateUserModel {
  @IsString()
  @Length(3, 10)
  login: string;
  @IsString()
  @Length(6, 20)
  email: string;
  @IsString()
  password: string;
}
