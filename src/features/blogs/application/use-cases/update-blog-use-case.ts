import { ResultDTO } from '../../../../shared/dto';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

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
  constructor(private BlogsRepository: BlogsRepository) {}

  async execute(command: UpdateBlogCommand): Promise<ResultDTO<null>> {
    const blogResult = await this.BlogsRepository.findById(command.blogId);
    if (blogResult.hasError()) return new ResultDTO(blogResult.code);

    await blogResult.payload.changeData(
      command.name,
      command.description,
      command.websiteUrl,
    );

    return this.BlogsRepository.save(blogResult.payload);
  }
}
