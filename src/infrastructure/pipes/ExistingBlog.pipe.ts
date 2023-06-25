import {
  ArgumentMetadata,
  Injectable,
  NotFoundException,
  PipeTransform,
} from '@nestjs/common';
import { BlogsRepository } from '../../features/blogs/infrastructure/blogs.repository';

@Injectable()
export class ExistingBlogPipe implements PipeTransform {
  constructor(private BlogRepository: BlogsRepository) {}

  async transform(value: string, metadata: ArgumentMetadata) {
    const user = await this.BlogRepository.findById(value);
    if (!user) throw new NotFoundException();

    return user._id.toString();
  }
}
