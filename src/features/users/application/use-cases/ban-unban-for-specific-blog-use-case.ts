import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ResultDTO } from '../../../../shared/dto';
import { UsersRepository } from '../../infrastructure/users/users.repository';
import { InternalCode } from '../../../../shared/enums';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';

export class BanUnbanForSpecificBlogCommand {
  constructor(
    public userId: string,
    public isBanned: boolean,
    public banReason: string,
    public blogId: string,
    public currentUserId: string,
  ) {}
}

@CommandHandler(BanUnbanForSpecificBlogCommand)
export class BanUnbanForSpecificBlogUseCase
  implements ICommandHandler<BanUnbanForSpecificBlogCommand>
{
  constructor(
    private UsersRepository: UsersRepository,
    private BlogsRepository: BlogsRepository,
  ) {}

  async execute(
    command: BanUnbanForSpecificBlogCommand,
  ): Promise<ResultDTO<null>> {
    const userResult = await this.UsersRepository.findById(+command.userId);
    if (userResult.hasError())
      return new ResultDTO(InternalCode.Internal_Server);

    const blogResult = await this.BlogsRepository.findById(command.blogId);
    if (blogResult.hasError())
      return new ResultDTO(InternalCode.Internal_Server);

    if (blogResult.payload.userId !== command.currentUserId)
      return new ResultDTO(InternalCode.Forbidden);

    return this.UsersRepository.banUserForSpecificBlog(
      command.userId,
      command.blogId,
      command.isBanned,
      command.banReason,
    );
  }
}
