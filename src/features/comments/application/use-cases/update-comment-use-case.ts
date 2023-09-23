import { ResultDTO } from '../../../../shared/dto';
import { InternalCode } from '../../../../shared/enums';
import { CommentsRepository } from '../../infrastructure/comment/comments.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class UpdateCommentCommand {
  constructor(
    public commentId: string,
    public content: string,
    public currentUserId: string,
  ) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase
  implements ICommandHandler<UpdateCommentCommand>
{
  constructor(private commentsRepository: CommentsRepository) {}

  async execute(command: UpdateCommentCommand): Promise<ResultDTO<null>> {
    const commentResult = await this.commentsRepository.findById(
      +command.commentId,
    );
    if (commentResult.hasError()) return commentResult as ResultDTO<null>;

    if (commentResult.payload.userId !== +command.currentUserId)
      return new ResultDTO(InternalCode.Forbidden);

    commentResult.payload.content = command.content;

    return this.commentsRepository.save(commentResult.payload);
  }
}
