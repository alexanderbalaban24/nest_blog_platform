import { Injectable } from '@nestjs/common';
import { BlogsRepository } from '../infrastructure/blogs.repository';
import { PostsRepository } from '../../posts/infrastructure/posts.repository';
import { ResultDTO } from '../../../shared/dto';
import { PostDocument } from '../../posts/domain/posts.entity';
import { InternalCode } from '../../../shared/enums';
import { BlogDocument } from '../domain/blogs.entity';

@Injectable()
export class BlogsService {
  constructor(
    private BlogsRepository: BlogsRepository,
    private PostsRepository: PostsRepository,
  ) {}

  async validatePostData(
    blogId: string,
    postId: string,
    userId: string,
  ): Promise<ResultDTO<null>> {
    const blogResult = await this.BlogsRepository.findById(blogId);
    const postResult = await this.PostsRepository.findById(postId);

    if (blogResult.hasError()) return blogResult as ResultDTO<null>;
    if (postResult.hasError()) return postResult as ResultDTO<null>;

    if (blogResult.payload.userId !== userId)
      return new ResultDTO(InternalCode.Forbidden);
    if (
      postResult.payload.blogId !== blogId ||
      userId !== postResult.payload.userId
    )
      return new ResultDTO(InternalCode.Forbidden);

    return new ResultDTO(InternalCode.Success);
  }
}
