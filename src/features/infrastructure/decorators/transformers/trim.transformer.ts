import { Injectable, PipeTransform } from '@nestjs/common';
import { registerDecorator, ValidationOptions } from 'class-validator';

@Injectable()
export class TrimConstraint implements PipeTransform {
  transform(value: string) {
    console.log('QQQQQQQQQQQQQQQ');
    return value.trim();
  }
}

export function Trim(validationOptions?: ValidationOptions) {
  return function (object: NonNullable<unknown>, propertyName: string) {
    registerDecorator({
      name: 'Trim',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: TrimConstraint,
    });
  };
}
