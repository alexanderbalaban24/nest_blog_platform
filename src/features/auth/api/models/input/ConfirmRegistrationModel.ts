import { IsString } from 'class-validator';
import { IsValidConfirmationCode } from '../../../../../decorators/validators/confirmationCode.validator';

export class ConfirmRegistrationModel {
  @IsString()
  @IsValidConfirmationCode()
  code: string;
}
