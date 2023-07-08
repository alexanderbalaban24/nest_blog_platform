import { ResultDTO } from '../../../../shared/dto';
import { InternalCode } from '../../../../shared/enums';
import { BlogsQueryRepository } from '../../../blogs/infrastructure/blogs.query-repository';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class UpdatePostCommand {
  constructor(
    public postId: string,
    public blogId: string,
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
      command.blogId,
    );
    if (blogResult.hasError())
      return new ResultDTO(InternalCode.Internal_Server);

    const postResult = await this.PostsRepository.findById(command.postId);
    if (postResult.hasError()) return postResult as ResultDTO<null>;

    await postResult.payload.changeData(
      command.title,
      command.shortDescription,
      command.content,
      command.blogId,
      blogResult.payload.name,
    );

    return await this.PostsRepository.save(postResult.payload);
  }
}
