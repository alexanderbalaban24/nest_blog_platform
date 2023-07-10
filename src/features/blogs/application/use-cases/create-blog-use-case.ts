import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ResultDTO } from '../../../../shared/dto';
import { Blog, BlogModelType } from '../../domain/blogs.entity';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { InjectModel } from '@nestjs/mongoose';
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
    @InjectModel(Blog.name) private BlogModel: BlogModelType,
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

    const newBlogInstance = this.BlogModel.makeInstance(
      command.name,
      command.description,
      command.websiteUrl,
      command.userId,
      userResult.payload.login,
      this.BlogModel,
    );

    return this.BlogsRepository.create(newBlogInstance);
  }
}
