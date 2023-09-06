import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { UsersRepository } from '../../../users/infrastructure/users/users.repository';
import { Injectable } from '@nestjs/common';

@ValidatorConstraint({ async: true })
@Injectable()
export class ExistUserValidator implements ValidatorConstraintInterface {
  constructor(private usersRepository: UsersRepository) {}

  async validate(id: string): Promise<boolean> {
    debugger;
    try {
      const userResult = await this.usersRepository.findById(+id);
      return !userResult.hasError();
    } catch (e) {
      return false;
    }
  }

  defaultMessage(): string {
    return 'User with input id not exist';
  }
}

export function IsExistUser(validationOptions?: ValidationOptions) {
  return function (object: NonNullable<unknown>, propertyName: string) {
    registerDecorator({
      name: 'IsExistUser',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: ExistUserValidator,
    });
  };
}
