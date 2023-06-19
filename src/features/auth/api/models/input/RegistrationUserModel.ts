import { IsString, Length, Matches } from 'class-validator';

export class RegistrationUserModel {
  @IsString()
  @Length(3, 10)
  login: string;
  @IsString()
  @Matches('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$')
  email: string;
  @IsString()
  @Length(6, 20)
  @Matches('^[a-zA-Z0-9_-]*$')
  password: string;
}
