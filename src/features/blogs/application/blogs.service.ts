import { Injectable } from '@nestjs/common';
import { BlogsRepository } from '../infrastructure/blogs.repository';
import { PostsRepository } from '../../posts/infrastructure/posts.repository';
import { ResultDTO } from '../../../shared/dto';
import { InternalCode } from '../../../shared/enums';

@Injectable()
export class BlogsService {
  constructor(
    private BlogsRepository: BlogsRepository,
    private PostsRepository: PostsRepository,
  ) {}

  async validatePostData(
    blogId: number,
    postId: number,
  ): Promise<ResultDTO<null>> {
    //const blogResult = await this.BlogsRepository.findById(+blogId);
    const postResult = await this.PostsRepository.findById(postId);

    //if (blogResult.hasError()) return blogResult as ResultDTO<null>;
    if (postResult.hasError()) return postResult as ResultDTO<null>;

    /*if (blogResult.payload.userId !== userId)
      return new ResultDTO(InternalCode.Forbidden);*/
    if (postResult.payload.blogId !== blogId)
      return new ResultDTO(InternalCode.Forbidden);

    return new ResultDTO(InternalCode.Success);
  }
}
