import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { AuthQueryRepository } from '../../features/auth/infrastructure/auth.query-repository';

@ValidatorConstraint({ async: true })
@Injectable()
export class ConfirmEmailValidator implements ValidatorConstraintInterface {
  constructor(private authQueryRepository: AuthQueryRepository) {}

  async validate(email: string): Promise<boolean> {
    try {
      const user = await this.authQueryRepository.findUserByCredentials(email);
      if (!user || user.emailConfirmation.isConfirmed) return false;

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
