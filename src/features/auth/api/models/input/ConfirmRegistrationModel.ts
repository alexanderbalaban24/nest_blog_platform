import { IsString } from 'class-validator';
import { IsValidConfirmationCode } from '../../../../infrastructure/decorators/validators/confirmationCode.validator';

export class ConfirmRegistrationModel {
  @IsString()
  @IsValidConfirmationCode()
  code: string;
}
