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
    const userResult = await this.CommentsRepository.findById(value);
    if (userResult.hasError()) throw new NotFoundException();

    return userResult.payload._id.toString();
  }
}
