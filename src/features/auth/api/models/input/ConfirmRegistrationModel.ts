import { IsString } from 'class-validator';
import { IsValidConfirmationCode } from '../../../../infrastructure/decorators/validators/confirmationCode.validator';
import { Transform } from 'class-transformer';

export class ConfirmRegistrationModel {
  @IsString()
  @Transform(({ value }) => value.trim())
  @IsValidConfirmationCode()
  code: string;
}
