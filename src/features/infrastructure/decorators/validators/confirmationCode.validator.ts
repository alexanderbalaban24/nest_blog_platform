import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Inject, Injectable } from '@nestjs/common';
import { AuthQueryRepository } from '../../../auth/infrastructure/auth.query-repository';
import { isAfter } from 'date-fns';

@ValidatorConstraint({ async: true })
@Injectable()
export class ConfirmationCodeValidator implements ValidatorConstraintInterface {
  constructor(private authQueryRepository: AuthQueryRepository) {}

  async validate(code: string): Promise<boolean> {
    try {
      const findResult =
        await this.authQueryRepository.findConfirmationOrRecoveryDataById(code);
      if (findResult.hasError()) return false;

      if (
        findResult.payload.isConfirmed ||
        isAfter(new Date(), findResult.payload.expirationDate)
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
