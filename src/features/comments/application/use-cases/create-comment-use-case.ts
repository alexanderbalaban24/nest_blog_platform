import { ResultDTO } from '../../../../shared/dto';
import { InternalCode } from '../../../../shared/enums';
import { PostsQueryRepository } from '../../../posts/infrastructure/posts/posts.query-repository';
import { UsersQueryRepository } from '../../../users/infrastructure/users/users.query-repository';
import { CommentsRepository } from '../../infrastructure/comment/comments.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../users/infrastructure/users/users.repository';
import { Comment } from '../../entities/comment.entity';
import { PostsRepository } from '../../../posts/infrastructure/posts/posts.repository';

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
    private commentsRepository: CommentsRepository,
    private postsRepository: PostsRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute(
    command: CreateCommentCommand,
  ): Promise<ResultDTO<{ commentId: number }>> {
    const postResult = await this.postsRepository.findById(+command.postId);
    if (postResult.hasError()) return new ResultDTO(InternalCode.NotFound);

    const userResult = await this.usersRepository.findById(+command.userId);
    if (userResult.hasError())
      return new ResultDTO(InternalCode.Internal_Server);
    /*const checkAccess = await this.UsersRepository.checkUserAccessForBlog(
      command.userId,
      postResult.payload.blogId,
    );
    if (!checkAccess.payload) return new ResultDTO(InternalCode.Forbidden);*/
    const comment = new Comment();
    comment.content = command.content;
    comment.postId = postResult.payload.id;
    comment.userId = userResult.payload.id;

    return this.commentsRepository.create(comment);
  }
}
