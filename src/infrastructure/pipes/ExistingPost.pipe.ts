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
    const user = await this.PostRepository.findById(value);
    if (!user) throw new NotFoundException();

    return user._id.toString();
  }
}
