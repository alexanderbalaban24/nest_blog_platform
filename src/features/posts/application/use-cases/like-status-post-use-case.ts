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
    const postResult = await this.PostsRepository.findById(command.postId);
    if (postResult.hasError()) return postResult as ResultDTO<null>;

    const userResult = await this.UsersRepository.findById(command.userId);
    if (userResult.hasError()) return userResult as ResultDTO<null>;

    postResult.payload.like(
      command.userId,
      userResult.payload.login,
      command.likeStatus,
    );

    return this.PostsRepository.save(postResult.payload);
  }
}
