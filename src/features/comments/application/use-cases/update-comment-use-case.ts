import { ResultDTO } from '../../../../shared/dto';
import { InternalCode } from '../../../../shared/enums';
import { CommentsRepository } from '../../infrastructure/comments.repository';
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
  constructor(private CommentRepository: CommentsRepository) {}

  async execute(command: UpdateCommentCommand): Promise<ResultDTO<null>> {
    const commentResult = await this.CommentRepository.findById(
      command.commentId,
    );
    if (commentResult.hasError()) return commentResult as ResultDTO<null>;

    if (commentResult.payload.commentatorInfo.userId !== command.currentUserId)
      return new ResultDTO(InternalCode.Forbidden);

    commentResult.payload.updateData(command.content, command.currentUserId);

    return this.CommentRepository.save(commentResult.payload);
  }
}
