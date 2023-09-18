import { ResultDTO } from '../../../../shared/dto';
import { InternalCode } from '../../../../shared/enums';
import { PostsQueryRepository } from '../../../posts/infrastructure/posts.query-repository';
import { UsersQueryRepository } from '../../../users/infrastructure/users/users.query-repository';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../users/infrastructure/users/users.repository';

export class CreateCommentCommand {
  constructor(
    public postId: number,
    public content: string,
    public userId: string,
  ) {}
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase
  implements ICommandHandler<CreateCommentCommand>
{
  constructor(
    private CommentRepository: CommentsRepository,
    private PostsQueryRepository: PostsQueryRepository,
    private UsersQueryRepository: UsersQueryRepository,
    private UsersRepository: UsersRepository,
  ) {}

  async execute(
    command: CreateCommentCommand,
  ): Promise<ResultDTO<{ commentId: string }>> {
    const postResult = await this.PostsQueryRepository.findPostById(
      command.postId,
    );
    if (postResult.hasError()) return new ResultDTO(InternalCode.NotFound);

    const userResult = await this.UsersQueryRepository.findUserById(
      command.userId,
    );
    if (userResult.hasError())
      return new ResultDTO(InternalCode.Internal_Server);
    console.log(command.userId, postResult.payload.blogId);
    const checkAccess = await this.UsersRepository.checkUserAccessForBlog(
      command.userId,
      postResult.payload.blogId,
    );
    if (!checkAccess.payload) return new ResultDTO(InternalCode.Forbidden);

    return this.CommentRepository.createComment(
      postResult.payload.id,
      command.content,
      userResult.payload.id,
    );
  }
}
