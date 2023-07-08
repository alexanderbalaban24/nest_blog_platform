import { ResultDTO } from '../../../../shared/dto';
import { InternalCode } from '../../../../shared/enums';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class DeletePostCommand {
  constructor(public postId: string) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand> {
  constructor(private PostsRepository: PostsRepository) {}

  async execute(command: DeletePostCommand): Promise<ResultDTO<null>> {
    const postResult = await this.PostsRepository.findById(command.postId);
    if (postResult.hasError()) return postResult as ResultDTO<null>;

    await postResult.payload.deleteOne();

    return new ResultDTO(InternalCode.Success);
  }
}
