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
    const commentResult = await this.CommentsRepository.findById(value);
    if (commentResult.hasError()) throw new NotFoundException();

    return commentResult.payload.id;
  }
}
