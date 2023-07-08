import { ResultDTO } from '../../../../shared/dto';
import { InternalCode } from '../../../../shared/enums';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class DeleteCommentCommand {
  constructor(public commentId: string, public currentUserId: string) {}
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase
  implements ICommandHandler<DeleteCommentCommand>
{
  constructor(private CommentRepository: CommentsRepository) {}

  async execute(command: DeleteCommentCommand): Promise<ResultDTO<null>> {
    const commentResult = await this.CommentRepository.findById(
      command.commentId,
    );
    if (commentResult.hasError()) return commentResult as ResultDTO<null>;

    if (commentResult.payload.commentatorInfo.userId !== command.currentUserId)
      return new ResultDTO(InternalCode.Forbidden);
    await commentResult.payload.deleteOne();

    return new ResultDTO(InternalCode.Success);
  }
}
