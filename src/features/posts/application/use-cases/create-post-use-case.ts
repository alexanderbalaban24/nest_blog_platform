import { ResultDTO } from '../../../../shared/dto';
import { InternalCode } from '../../../../shared/enums';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsQueryRepository } from '../../../blogs/infrastructure/blogs.query-repository';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostModelType } from '../../domain/posts.entity';
import { PostsRepository } from '../../infrastructure/posts.repository';

export class CreatePostCommand {
  constructor(
    public ownerId: string,
    public blogId: string,
    public title: string,
    public shortDescription: string,
    public content: string,
  ) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(
    @InjectModel(Post.name) private PostModel: PostModelType,
    private PostsRepository: PostsRepository,
    private BlogsQueryRepository: BlogsQueryRepository,
  ) {}

  async execute(
    command: CreatePostCommand,
  ): Promise<ResultDTO<{ postId: string }>> {
    const blogResult = await this.BlogsQueryRepository.findBlogById(
      command.blogId,
    );
    if (blogResult.hasError())
      return new ResultDTO(InternalCode.Internal_Server);

    const postInstance = await this.PostModel.makeInstance(
      command.ownerId,
      command.title,
      command.shortDescription,
      command.content,
      command.blogId,
      blogResult.payload.name,
      this.PostModel,
    );

    return this.PostsRepository.create(postInstance);
  }
}
