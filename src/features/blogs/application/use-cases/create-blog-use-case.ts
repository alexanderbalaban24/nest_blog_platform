import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ResultDTO } from '../../../../shared/dto';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { UsersQueryRepository } from '../../../users/infrastructure/users.query-repository';
import { InternalCode } from '../../../../shared/enums';

export class CreateBlogCommand {
  constructor(
    public name: string,
    public description: string,
    public websiteUrl: string,
    public userId: string,
  ) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
  constructor(
    private BlogsRepository: BlogsRepository,
    private UsersQueryRepository: UsersQueryRepository,
  ) {}

  async execute(
    command: CreateBlogCommand,
  ): Promise<ResultDTO<{ blogId: string }>> {
    const userResult = await this.UsersQueryRepository.findUserById(
      command.userId,
    );
    if (userResult.hasError())
      return new ResultDTO(InternalCode.Internal_Server);

    return this.BlogsRepository.createBlog(
      command.name,
      command.description,
      command.websiteUrl,
      command.userId,
    );
  }
}
