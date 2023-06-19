import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Inject, Injectable } from '@nestjs/common';
import { AuthQueryRepository } from '../../features/auth/infrastructure/auth.query-repository';
import { isAfter } from 'date-fns';

@ValidatorConstraint({ async: true })
@Injectable()
export class ConfirmationCodeValidator implements ValidatorConstraintInterface {
  constructor(private authQueryRepository: AuthQueryRepository) {}

  async validate(code: string): Promise<boolean> {
    try {
      const userId = await this.authQueryRepository.findUserByConfirmationCode(
        code,
      );
      if (!userId) return false;

      const confirmationData =
        await this.authQueryRepository.findUserWithConfirmationDataById(userId);
      if (
        confirmationData.isConfirmed ||
        isAfter(new Date(), confirmationData.expirationDate)
      ) {
        return false;
      }

      return true;
    } catch (e) {
      return false;
    }
  }

  defaultMessage(): string {
    return 'Confirmation code should be exist';
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
