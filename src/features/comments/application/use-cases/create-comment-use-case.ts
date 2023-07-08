import { ResultDTO } from '../../../../shared/dto';
import { InternalCode } from '../../../../shared/enums';
import { PostsQueryRepository } from '../../../posts/infrastructure/posts.query-repository';
import { UsersQueryRepository } from '../../../users/infrastructure/users.query-repository';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentModelType } from '../../domain/comments.entity';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class CreateCommentCommand {
  constructor(
    public postId: string,
    public content: string,
    public userId: string,
  ) {}
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase
  implements ICommandHandler<CreateCommentCommand>
{
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
    private CommentRepository: CommentsRepository,
    private PostsQueryRepository: PostsQueryRepository,
    private UsersQueryRepository: UsersQueryRepository,
  ) {}

  async execute(
    command: CreateCommentCommand,
  ): Promise<ResultDTO<{ commentId: string }>> {
    const postResult = await this.PostsQueryRepository.findPostById(
      command.postId,
    );
    if (postResult.hasError())
      return new ResultDTO(InternalCode.Internal_Server);

    const userResult = await this.UsersQueryRepository.findUserById(
      command.userId,
    );
    if (userResult.hasError())
      return new ResultDTO(InternalCode.Internal_Server);

    const newCommentInstance = await this.CommentModel.makeInstance(
      postResult.payload.id,
      command.content,
      userResult.payload.id,
      userResult.payload.login,
      this.CommentModel,
    );

    return this.CommentRepository.create(newCommentInstance);
  }
}
