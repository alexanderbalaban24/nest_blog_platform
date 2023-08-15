import { ResultDTO } from '../../../../shared/dto';
import { InternalCode } from '../../../../shared/enums';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsQueryRepository } from '../../../blogs/infrastructure/blogs.query-repository';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostModelType } from '../../domain/posts.entity';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';

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
    private BlogsRepository: BlogsRepository,
  ) {}

  async execute(
    command: CreatePostCommand,
  ): Promise<ResultDTO<{ postId: string }>> {
    //TODO делать запрос через команд репозиторий
    const blogResult = await this.BlogsRepository.findById(command.blogId);
    if (blogResult.hasError())
      return new ResultDTO(InternalCode.Internal_Server);

    if (command.ownerId !== blogResult.payload.userId)
      return new ResultDTO(InternalCode.Forbidden);

    return this.PostsRepository.createPost(
      command.ownerId,
      command.title,
      command.shortDescription,
      command.content,
      command.blogId,
    );
  }
}
