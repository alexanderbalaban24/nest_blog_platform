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
    const user = await this.UserRepository.findById(value);
    if (!user) throw new NotFoundException();

    return user._id.toString();
  }
}
