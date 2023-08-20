import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { ResultDTO } from '../../../../shared/dto';

export class BanUnbanBlogCommand {
  constructor(public blogId: string, public isBanned: boolean) {}
}

@CommandHandler(BanUnbanBlogCommand)
export class BanUnbanBlogUseCase
  implements ICommandHandler<BanUnbanBlogCommand>
{
  constructor(private BlogsRepository: BlogsRepository) {}

  async execute(command: BanUnbanBlogCommand): Promise<ResultDTO<null>> {
    const banDate = command.isBanned ? new Date() : null;

    return this.BlogsRepository.banBlog(
      command.blogId,
      command.isBanned,
      banDate,
    );
  }
}
