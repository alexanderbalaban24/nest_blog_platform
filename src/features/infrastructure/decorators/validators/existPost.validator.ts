import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { PostsRepository } from '../../../posts/infrastructure/posts.repository';

@ValidatorConstraint({ async: true })
@Injectable()
export class ExistPostValidator implements ValidatorConstraintInterface {
  constructor(private PostRepository: PostsRepository) {}

  async validate(id: string): Promise<boolean> {
    debugger;
    try {
      const user = await this.PostRepository.findById(id);
      return !!user;
    } catch (e) {
      return false;
    }
  }

  defaultMessage(): string {
    return 'User with input id not exist';
  }
}

export function IsExistPost(validationOptions?: ValidationOptions) {
  return function (object: NonNullable<unknown>, propertyName: string) {
    registerDecorator({
      name: 'IsExistPost',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: ExistPostValidator,
    });
  };
}
