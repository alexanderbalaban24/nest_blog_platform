import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ResultDTO } from '../../../../shared/dto';
import { UsersRepository } from '../../infrastructure/users.repository';
import { InternalCode } from '../../../../shared/enums';

export class BanUnbanForSpecificBlogCommand {
  constructor(
    public userId: string,
    public isBanned: boolean,
    public banReason: string,
    public blogId: string,
  ) {}
}

@CommandHandler(BanUnbanForSpecificBlogCommand)
export class BanUnbanForSpecificBlogUseCase
  implements ICommandHandler<BanUnbanForSpecificBlogCommand>
{
  constructor(private UsersRepository: UsersRepository) {}

  async execute(
    command: BanUnbanForSpecificBlogCommand,
  ): Promise<ResultDTO<null>> {
    const userResult = await this.UsersRepository.findById(command.userId);
    if (userResult.hasError())
      return new ResultDTO(InternalCode.Internal_Server);

    userResult.payload.banForSpecificBlog(
      command.blogId,
      command.isBanned,
      command.banReason,
    );

    return this.UsersRepository.save(userResult.payload);
  }
}
