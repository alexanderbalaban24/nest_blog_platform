import { LikeStatusEnum } from '../../../../shared/enums';
import { ResultDTO } from '../../../../shared/dto';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

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
  constructor(private CommentRepository: CommentsRepository) {}

  async execute(command: LikeStatusCommentCommand): Promise<ResultDTO<null>> {
    return this.CommentRepository.likeById(
      command.commentId,
      command.userId,
      command.likeStatus,
    );
  }
}
