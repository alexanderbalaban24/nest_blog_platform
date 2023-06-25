import { IsString, Matches } from 'class-validator';
import { IsValidAndNotConfirmed } from '../../../../infrastructure/decorators/validators/confirmEmail.validator';
import { Transform } from 'class-transformer';

export class ResendRegistrationModel {
  @IsString()
  @Transform(({ value }) => value.trim())
  @Matches('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$')
  @IsValidAndNotConfirmed()
  email: string;
}
