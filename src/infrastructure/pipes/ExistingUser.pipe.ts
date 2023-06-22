import { ParseObjectIdPipe } from './ParseObjectId.pipe';
import {
  ArgumentMetadata,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersRepository } from '../../features/users/infrastructure/users.repository';
import { Types } from 'mongoose';

@Injectable()
export class ExistingUserPipe extends ParseObjectIdPipe {
  constructor(private userRepository: UsersRepository) {
    super();
  }

  async transform(value: string, metadata: ArgumentMetadata) {
    debugger;
    const userId = await super.transform(value, metadata);
    const user = await this.userRepository.findById(userId as Types.ObjectId);
    if (!user) throw new NotFoundException();

    return userId;
  }
}
