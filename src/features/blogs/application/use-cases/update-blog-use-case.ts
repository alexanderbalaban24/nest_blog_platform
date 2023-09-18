import { ResultDTO } from '../../../../shared/dto';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InternalCode } from '../../../../shared/enums';

export class UpdateBlogCommand {
  constructor(
    public blogId: string,
    public name: string,
    public description: string,
    public websiteUrl: string,
  ) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<UpdateBlogCommand> {
  constructor(private blogsRepository: BlogsRepository) {}

  async execute(command: UpdateBlogCommand): Promise<ResultDTO<null>> {
    const blogResult = await this.blogsRepository.findById(+command.blogId);
    if (blogResult.hasError()) return new ResultDTO(blogResult.code);

    const blog = await this.blogsRepository.findById(+command.blogId);
    if (blog.hasError()) return blog as ResultDTO<null>;

    blog.payload.name = command.name;
    blog.payload.description = command.description;
    blog.payload.websiteUrl = command.websiteUrl;

    return this.blogsRepository.save(blog.payload);
  }
}
