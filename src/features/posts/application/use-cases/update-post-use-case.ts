import { ResultDTO } from '../../../../shared/dto';
import { InternalCode } from '../../../../shared/enums';
import { BlogsQueryRepository } from '../../../blogs/infrastructure/blogs.query-repository';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class UpdatePostCommand {
  constructor(
    public postId: string,
    public blogId: string,
    public userId: string,
    public title: string,
    public shortDescription: string,
    public content: string,
  ) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand> {
  constructor(
    private BlogsQueryRepository: BlogsQueryRepository,
    private PostsRepository: PostsRepository,
  ) {}

  async execute(command: UpdatePostCommand): Promise<ResultDTO<null>> {
    const blogResult = await this.BlogsQueryRepository.findBlogById(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      command.blogId,
    );
    if (blogResult.hasError())
      return new ResultDTO(InternalCode.Internal_Server);

    const postResult = await this.PostsRepository.findById(+command.postId);
    if (postResult.hasError())
      return new ResultDTO(InternalCode.Internal_Server);

    if (
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      blogResult.payload.blogOwnerInfo.userId !== command.userId ||
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      postResult.payload.blogId !== blogResult.payload.id
    )
      return new ResultDTO(InternalCode.Forbidden);

    return await this.PostsRepository.updateById(
      command.title,
      command.shortDescription,
      command.content,
      command.postId,
    );
  }
}
