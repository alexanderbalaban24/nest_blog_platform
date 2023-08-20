import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { ResultDTO } from '../../../../shared/dto';

export class BindUserCommand {
  constructor(public blogId: string, public userId: string) {}
}

@CommandHandler(BindUserCommand)
export class BindUserUseCase implements ICommandHandler<BindUserCommand> {
  constructor(private BlogsRepository: BlogsRepository) {}

  async execute(command: BindUserCommand): Promise<ResultDTO<null>> {
    return this.BlogsRepository.bindBlog(command.blogId, command.userId);
  }
}
