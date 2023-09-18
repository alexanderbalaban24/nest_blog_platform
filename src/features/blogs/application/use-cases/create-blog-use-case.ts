import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ResultDTO } from '../../../../shared/dto';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { UsersQueryRepository } from '../../../users/infrastructure/users/users.query-repository';
import { InternalCode } from '../../../../shared/enums';
import { Blog } from '../../entities/blog.entity';

export class CreateBlogCommand {
  constructor(
    public name: string,
    public description: string,
    public websiteUrl: string,
    public userId?: string,
  ) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
  constructor(private blogsRepository: BlogsRepository) {}

  async execute(
    command: CreateBlogCommand,
  ): Promise<ResultDTO<{ blogId: number }>> {
    const blog = new Blog();
    blog.name = command.name;
    blog.description = command.description;
    blog.websiteUrl = command.websiteUrl;

    return this.blogsRepository.create(blog);
  }
}
