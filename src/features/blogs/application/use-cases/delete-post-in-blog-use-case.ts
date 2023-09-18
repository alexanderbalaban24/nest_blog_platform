import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ResultDTO } from '../../../../shared/dto';
import { BlogsService } from '../blogs.service';
import { PostsRepository } from '../../../posts/infrastructure/posts.repository';

export class DeletePostCommand {
  constructor(public blogId: string, public postId: string) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostInBlogUseCase
  implements ICommandHandler<DeletePostCommand>
{
  constructor(
    private BlogsService: BlogsService,
    private postsRepository: PostsRepository,
  ) {}

  async execute(command: DeletePostCommand): Promise<ResultDTO<null>> {
    const result = await this.BlogsService.validatePostData(
      +command.blogId,
      +command.postId,
    );
    if (result.hasError()) return result as ResultDTO<null>;

    return this.postsRepository.deleteById(+command.postId);
  }
}
