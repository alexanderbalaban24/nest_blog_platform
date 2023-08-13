import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { AuthRepository } from '../../../auth/infrastructure/auth.repository';

@ValidatorConstraint({ async: true })
@Injectable()
export class ConfirmEmailValidator implements ValidatorConstraintInterface {
  constructor(private authRepository: AuthRepository) {}

  async validate(email: string): Promise<boolean> {
    try {
      const userResult = await this.authRepository.findByCredentials(email);
      if (userResult.hasError() || userResult.payload.isConfirmed) return false;

      return true;
    } catch (e) {
      return false;
    }
  }

  defaultMessage(): string {
    return 'Email not exist or already confirmed';
  }
}

export function IsValidAndNotConfirmed(validationOptions?: ValidationOptions) {
  return function (object: NonNullable<unknown>, propertyName: string) {
    registerDecorator({
      name: 'IsValidAndNotConfirmed',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: ConfirmEmailValidator,
    });
  };
}
