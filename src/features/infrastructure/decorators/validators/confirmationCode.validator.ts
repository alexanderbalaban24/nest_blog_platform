import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { AuthQueryRepository } from '../../../auth/infrastructure/auth.query-repository';
import { isAfter } from 'date-fns';
import { EmailConfirmationQueryRepository } from '../../../users/infrastructure/email-confirmation/email-confirmation.query-repository';

@ValidatorConstraint({ async: true })
@Injectable()
export class ConfirmationCodeValidator implements ValidatorConstraintInterface {
  constructor(
    private authQueryRepository: AuthQueryRepository,
    private emailConfirmQueryRepository: EmailConfirmationQueryRepository,
  ) {}

  async validate(code: string): Promise<boolean> {
    try {
      const findConfirmResult =
        await this.emailConfirmQueryRepository.findConfirmationByCode(code);
      console.log(findConfirmResult, findConfirmResult.hasError());
      /*const findRecoveryResult =
        await this.authQueryRepository.findConfirmationOrRecoveryDataByCode(
          code,
          AuthAction.Recovery,
        );*/

      if (findConfirmResult.hasError() /* && findRecoveryResult.hasError()*/)
        return false;

      if (
        findConfirmResult.payload?.isConfirmed ||
        /*findRecoveryResult.payload?.isConfirmed ||*/
        isAfter(new Date(), findConfirmResult.payload?.expirationDate) /* &&
          isAfter(new Date(), findRecoveryResult.payload?.expirationDate)*/
      ) {
        return false;
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  defaultMessage(): string {
    return 'Confirmation code should be exist and actually';
  }
}

export function IsValidConfirmationCode(validationOptions?: ValidationOptions) {
  return function (object: NonNullable<unknown>, propertyName: string) {
    registerDecorator({
      name: 'IsValidConfirmationCode',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: ConfirmationCodeValidator,
    });
  };
}
