import { IsEmail, IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateUserModel {
  @IsString()
  @Transform(({ value }) => value.trim())
  @Length(3, 10)
  login: string;
  @IsString()
  @Transform(({ value }) => value.trim())
  @IsEmail()
  email: string;
  @IsString()
  @Transform(({ value }) => value.trim())
  @Length(6, 20)
  password: string;
}
