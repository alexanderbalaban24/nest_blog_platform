import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ResultDTO } from '../../../../shared/dto';
import { PostsRepository } from '../../../posts/infrastructure/posts/posts.repository';
import { BlogsService } from '../blogs.service';

export class UpdatePostCommand {
  constructor(
    public blogId: string,
    public postId: string,
    public title: string,
    public shortDescription: string,
    public content: string,
  ) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostInBlogUseCase
  implements ICommandHandler<UpdatePostCommand>
{
  constructor(
    private blogsService: BlogsService,
    private postsRepository: PostsRepository,
  ) {}

  async execute(command: UpdatePostCommand): Promise<ResultDTO<null>> {
    const result = await this.blogsService.validatePostData(
      +command.blogId,
      +command.postId,
    );
    if (result.hasError()) return result as ResultDTO<null>;

    const post = await this.postsRepository.findById(+command.postId);
    if (post.hasError()) return post as ResultDTO<null>;

    post.payload.title = command.title;
    post.payload.shortDescription = command.shortDescription;
    post.payload.content = command.content;

    return this.postsRepository.save(post.payload);
  }
}
