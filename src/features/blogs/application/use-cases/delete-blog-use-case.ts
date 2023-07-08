import { ResultDTO } from '../../../../shared/dto';
import { InternalCode } from '../../../../shared/enums';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class DeleteBlogCommand {
  constructor(public blogId: string) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler<DeleteBlogCommand> {
  constructor(private BlogsRepository: BlogsRepository) {}

  async execute(command: DeleteBlogCommand): Promise<ResultDTO<null>> {
    const blogResult = await this.BlogsRepository.findById(command.blogId);
    if (blogResult.hasError()) return new ResultDTO(blogResult.code);

    await blogResult.payload.deleteOne();

    return new ResultDTO(InternalCode.Success);
  }
}
