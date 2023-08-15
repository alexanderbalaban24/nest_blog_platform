import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { ResultDTO } from '../../../../shared/dto';
import { InternalCode } from '../../../../shared/enums';
import { PostsRepository } from '../../../posts/infrastructure/posts.repository';

export class BanUnbanBlogCommand {
  constructor(public blogId: string, public isBanned: boolean) {}
}

@CommandHandler(BanUnbanBlogCommand)
export class BanUnbanBlogUseCase
  implements ICommandHandler<BanUnbanBlogCommand>
{
  constructor(
    private BlogsRepository: BlogsRepository,
    private PostsRepository: PostsRepository,
  ) {}

  async execute(command: BanUnbanBlogCommand): Promise<ResultDTO<null>> {
    const banDate = command.isBanned ? new Date() : null;

    return this.BlogsRepository.banBlog(
      command.blogId,
      command.isBanned,
      banDate,
    );

    /*const postsResult = await this.PostsRepository.findByBlogId(command.blogId);
    if (postsResult.hasError())
      return new ResultDTO(InternalCode.Internal_Server);
    const postPromises = postsResult.payload.map((postInstance) => {
      if (command.isBanned) {
        postInstance.deactivate();
      } else {
        postInstance.activate();
      }
      return this.PostsRepository.save(postInstance);
    });
    await Promise.all(postPromises);

    return this.BlogsRepository.save(blogResult.payload);*/
  }
}
