import { IsString, Length, Matches } from 'class-validator';
import { IsValidConfirmationCode } from '../../../../../decorators/validators/confirmationCode.validator';

export class UpdatePasswordModel {
  @IsString()
  @Length(6, 20)
  @Matches('^[a-zA-Z0-9_-]*$')
  newPassword: string;
  @IsString()
  @IsValidConfirmationCode()
  recoveryCode: string;
}
