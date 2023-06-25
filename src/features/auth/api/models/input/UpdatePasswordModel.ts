import { IsString, Length, Matches } from 'class-validator';
import { IsValidConfirmationCode } from '../../../../infrastructure/decorators/validators/confirmationCode.validator';
import { Transform } from 'class-transformer';

export class UpdatePasswordModel {
  @IsString()
  @Transform(({ value }) => value.trim())
  @Length(6, 20)
  @Matches('^[a-zA-Z0-9_-]*$')
  newPassword: string;
  @IsString()
  @Transform(({ value }) => value.trim())
  @IsValidConfirmationCode()
  recoveryCode: string;
}
