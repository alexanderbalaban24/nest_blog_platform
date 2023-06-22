import { IsString, Length, Matches } from 'class-validator';
import { IsUniqueLoginWithEmail } from '../../../../infrastructure/decorators/validators/uniqueLoginAndEmail.validator';

export class RegistrationUserModel {
  @IsString()
  @Length(3, 10)
  @IsUniqueLoginWithEmail()
  login: string;
  @IsString()
  @Matches('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$')
  @IsUniqueLoginWithEmail()
  email: string;
  @IsString()
  @Length(6, 20)
  @Matches('^[a-zA-Z0-9_-]*$')
  password: string;
}
