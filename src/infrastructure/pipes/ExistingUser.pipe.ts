import {
  ArgumentMetadata,
  Injectable,
  NotFoundException,
  PipeTransform,
} from '@nestjs/common';
import { UsersRepository } from '../../features/users/infrastructure/users.repository';

@Injectable()
export class ExistingUserPipe implements PipeTransform {
  constructor(private UserRepository: UsersRepository) {}

  async transform(value: string, metadata: ArgumentMetadata) {
    try {
      const userResult = await this.UserRepository.findById(value);
      if (userResult.hasError()) throw new NotFoundException();
      return userResult.payload.id;
    } catch (e) {
      throw new NotFoundException();
    }
  }
}
