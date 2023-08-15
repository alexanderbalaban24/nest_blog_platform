import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ResultDTO } from '../../../../shared/dto';
import { PostsRepository } from '../../../posts/infrastructure/posts.repository';
import { BlogsService } from '../blogs.service';

export class UpdatePostCommand {
  constructor(
    public blogId: string,
    public postId: string,
    public userId: string,
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
    private BlogsService: BlogsService,
    private PostsRepository: PostsRepository,
  ) {}

  async execute(command: UpdatePostCommand): Promise<ResultDTO<null>> {
    const result = await this.BlogsService.validatePostData(
      command.blogId,
      command.postId,
      command.userId,
    );
    if (result.hasError()) return result as ResultDTO<null>;

    return this.PostsRepository.updateById(
      command.title,
      command.shortDescription,
      command.content,
      command.postId,
    );
  }
}
