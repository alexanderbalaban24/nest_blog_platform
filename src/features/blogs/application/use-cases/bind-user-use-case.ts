import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { ResultDTO } from '../../../../shared/dto';
import { InternalCode } from '../../../../shared/enums';

export class BindUserCommand {
  constructor(public blogId: string, public userId: string) {}
}

@CommandHandler(BindUserCommand)
export class BindUserUseCase implements ICommandHandler<BindUserCommand> {
  constructor(
    private BlogsRepository: BlogsRepository,
    private UsersRepository: UsersRepository,
  ) {}

  async execute(command: BindUserCommand): Promise<ResultDTO<null>> {
    const userResult = await this.UsersRepository.findById(command.userId);
    if (userResult.hasError())
      return new ResultDTO(InternalCode.Internal_Server);

    const blogResult = await this.BlogsRepository.findById(command.blogId);
    if (blogResult.hasError())
      return new ResultDTO(InternalCode.Internal_Server);

    blogResult.payload.bindUser(command.userId, userResult.payload.login);

    return this.BlogsRepository.save(blogResult.payload);
  }
}
