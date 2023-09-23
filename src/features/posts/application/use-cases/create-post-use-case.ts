import { ResultDTO } from '../../../../shared/dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../infrastructure/posts/posts.repository';
import { Post } from '../../entities/post.entity';

export class CreatePostCommand {
  constructor(
    public blogId: string,
    public title: string,
    public shortDescription: string,
    public content: string,
  ) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(private PostsRepository: PostsRepository) {}

  async execute(
    command: CreatePostCommand,
  ): Promise<ResultDTO<{ postId: number }>> {
    const post = new Post();
    post.title = command.title;
    post.shortDescription = command.shortDescription;
    post.content = command.content;
    post.blogId = +command.blogId;

    return this.PostsRepository.create(post);
  }
}
