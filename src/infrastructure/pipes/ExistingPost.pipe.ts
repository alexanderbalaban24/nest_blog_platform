import {
  ArgumentMetadata,
  Injectable,
  NotFoundException,
  PipeTransform,
} from '@nestjs/common';
import { PostsRepository } from '../../features/posts/infrastructure/posts.repository';

@Injectable()
export class ExistingPostPipe implements PipeTransform {
  constructor(private PostRepository: PostsRepository) {}

  async transform(value: string, metadata: ArgumentMetadata) {
    try {
      const postResult = await this.PostRepository.findById(value);
      if (postResult.hasError()) throw new NotFoundException();
      return postResult.payload.id;
    } catch (e) {
      throw new NotFoundException();
    }
  }
}
