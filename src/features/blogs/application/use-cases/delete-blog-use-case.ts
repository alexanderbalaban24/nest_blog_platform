import { ResultDTO } from '../../../../shared/dto';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class DeleteBlogCommand {
  constructor(public blogId: string) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler<DeleteBlogCommand> {
  constructor(private BlogsRepository: BlogsRepository) {}

  async execute(command: DeleteBlogCommand): Promise<ResultDTO<null>> {
    return this.BlogsRepository.deleteById(command.blogId);
  }
}
