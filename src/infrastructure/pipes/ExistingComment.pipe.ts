import {
  ArgumentMetadata,
  Injectable,
  NotFoundException,
  PipeTransform,
} from '@nestjs/common';
import { CommentsRepository } from '../../features/comments/infrastructure/comments.repository';

@Injectable()
export class ExistingCommentPipe implements PipeTransform {
  constructor(private CommentsRepository: CommentsRepository) {}

  async transform(value: string, metadata: ArgumentMetadata) {
    const user = await this.CommentsRepository.findById(value);
    if (!user) throw new NotFoundException();

    return user._id.toString();
  }
}
