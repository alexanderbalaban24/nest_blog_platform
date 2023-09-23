import { LikeStatusEnum } from '../../../../shared/enums';
import { ResultDTO } from '../../../../shared/dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentLike } from '../../entities/comment-like.entity';
import { CommentsLikeRepository } from '../../infrastructure/like/like.repository';

export class LikeStatusCommentCommand {
  constructor(
    public commentId: string,
    public userId: string,
    public likeStatus: LikeStatusEnum,
  ) {}
}

@CommandHandler(LikeStatusCommentCommand)
export class LikeStatusCommentUseCase
  implements ICommandHandler<LikeStatusCommentCommand>
{
  constructor(private likeRepository: CommentsLikeRepository) {}

  async execute(command: LikeStatusCommentCommand): Promise<ResultDTO<null>> {
    const like = new CommentLike();
    like.status = LikeStatusEnum[command.likeStatus];
    like.userId = +command.userId;
    like.commentId = +command.commentId;

    return this.likeRepository.save(like);
  }
}
