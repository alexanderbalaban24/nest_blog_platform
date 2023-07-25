import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';

@ValidatorConstraint({ async: true })
@Injectable()
export class ExistBlogValidator implements ValidatorConstraintInterface {
  constructor(private BlogsRepository: BlogsRepository) {}

  async validate(id: string): Promise<boolean> {
    try {
      const blogResult = await this.BlogsRepository.findById(id);
      return !blogResult.hasError();
    } catch (e) {
      return false;
    }
  }

  defaultMessage(): string {
    return 'User with input id not exist';
  }
}

export function IsExistBlog(validationOptions?: ValidationOptions) {
  return function (object: NonNullable<unknown>, propertyName: string) {
    registerDecorator({
      name: 'IsExistBlog',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: ExistBlogValidator,
    });
  };
}
