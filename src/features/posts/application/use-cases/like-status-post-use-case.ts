import { LikeStatusEnum } from '../../../../shared/enums';
import { ResultDTO } from '../../../../shared/dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../infrastructure/posts/posts.repository';
import { PostLike } from '../../entities/post-like.entity';
import { PostsLikeRepository } from '../../infrastructure/posts-likes/likes.repository';

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
  constructor(private likesRepository: PostsLikeRepository) {}

  async execute(command: LikeStatusPostCommand): Promise<ResultDTO<null>> {
    const likeResult = await this.likesRepository.findLike(
      +command.postId,
      +command.userId,
    );

    let like: PostLike;
    if (likeResult.payload) {
      like = likeResult.payload;
    } else {
      like = new PostLike();
    }

    like.postId = +command.postId;
    like.userId = +command.userId;
    like.status = command.likeStatus;
    like.createdAt = new Date();

    return this.likesRepository.save(like);
  }
}
