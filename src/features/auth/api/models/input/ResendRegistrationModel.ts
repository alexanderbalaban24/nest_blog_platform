import { IsString, Matches } from 'class-validator';
import { IsValidAndNotConfirmed } from '../../../../infrastructure/decorators/validators/confirmEmail.validator';

export class ResendRegistrationModel {
  @IsString()
  @Matches('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$')
  @IsValidAndNotConfirmed()
  email: string;
}
