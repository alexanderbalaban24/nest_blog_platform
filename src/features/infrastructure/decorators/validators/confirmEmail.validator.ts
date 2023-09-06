import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../../users/infrastructure/users/users.repository';

@ValidatorConstraint({ async: true })
@Injectable()
export class ConfirmEmailValidator implements ValidatorConstraintInterface {
  constructor(private usersRepository: UsersRepository) {}

  async validate(email: string): Promise<boolean> {
    try {
      const userResult = await this.usersRepository.findByCredentials(email);
      if (userResult.hasError() || userResult.payload.emailConfirm.isConfirmed)
        return false;

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
