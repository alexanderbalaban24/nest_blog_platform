import { LikeStatusEnum } from '../../../../shared/enums';
import { ResultDTO } from '../../../../shared/dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { UsersRepository } from '../../../users/infrastructure/users.repository';

export class LikeStatusPostCommand {
  constructor(
    public postId: string,
    public userId: string,
    public likeStatus: LikeStatusEnum,
  ) {}
}

@CommandHandler(LikeStatusPostCommand)
export class LikeStatusPostUseCase
  implements ICommandHandler<LikeStatusPostCommand>
{
  constructor(
    private PostsRepository: PostsRepository,
    private UsersRepository: UsersRepository,
  ) {}

  async execute(command: LikeStatusPostCommand): Promise<ResultDTO<null>> {
    return this.PostsRepository.likeById(
      command.postId,
      command.userId,
      command.likeStatus,
      new Date(),
    );
  }
}
