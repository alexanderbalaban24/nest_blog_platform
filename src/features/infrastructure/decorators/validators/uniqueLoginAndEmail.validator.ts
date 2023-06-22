import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { AuthQueryRepository } from '../../../auth/infrastructure/auth.query-repository';
import { AuthRepository } from '../../../auth/infrastructure/auth.repository';

@ValidatorConstraint({ async: true })
@Injectable()
export class UniqueLoginAndEmailValidator
  implements ValidatorConstraintInterface
{
  constructor(private authRepository: AuthRepository) {}
  async validate(cred: string): Promise<boolean> {
    try {
      const user = await this.authRepository.findByCredentials(cred);
      if (user) return false;

      return true;
    } catch (e) {
      return false;
    }
  }

  defaultMessage(args: ValidationArguments): string {
    const property = args.property[0].toUpperCase() + args.property.slice(1);
    return `${property} not exist or already confirmed`;
  }
}

export function IsUniqueLoginWithEmail(validationOptions?: ValidationOptions) {
  return function (object: NonNullable<unknown>, propertyName: string) {
    registerDecorator({
      name: 'IsUniqueLoginWithEmail',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: UniqueLoginAndEmailValidator,
    });
  };
}
