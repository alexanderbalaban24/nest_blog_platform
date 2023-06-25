import { IsString, Length, Matches } from 'class-validator';
import { IsUniqueLoginWithEmail } from '../../../../infrastructure/decorators/validators/uniqueLoginAndEmail.validator';
import { Transform } from 'class-transformer';

export class RegistrationUserModel {
  @IsString()
  @Transform(({ value }) => value.trim())
  @Length(3, 10)
  @IsUniqueLoginWithEmail()
  login: string;
  @IsString()
  @Transform(({ value }) => value.trim())
  @Matches('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$')
  @IsUniqueLoginWithEmail()
  email: string;
  @IsString()
  @Transform(({ value }) => value.trim())
  @Length(6, 20)
  @Matches('^[a-zA-Z0-9_-]*$')
  password: string;
}
