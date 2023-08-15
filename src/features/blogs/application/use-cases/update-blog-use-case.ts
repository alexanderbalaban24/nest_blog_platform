import { ResultDTO } from '../../../../shared/dto';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InternalCode } from '../../../../shared/enums';

export class UpdateBlogCommand {
  constructor(
    public userId: string,
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

    if (blogResult.payload.userId !== command.userId)
      return new ResultDTO(InternalCode.Forbidden);

    return this.BlogsRepository.updateById(
      command.blogId,
      command.name,
      command.description,
      command.websiteUrl,
    );
  }
}
