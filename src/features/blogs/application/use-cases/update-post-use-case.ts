import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ResultDTO } from '../../../../shared/dto';
import { PostsRepository } from '../../../posts/infrastructure/posts.repository';
import { BlogsService } from '../blogs.service';

export class UpdatePostCommand {
  constructor(
    public blogId: string,
    public postId: string,
    public userId: string,
    public title: string,
    public shortDescription: string,
    public content: string,
  ) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand> {
  constructor(
    private BlogsService: BlogsService,
    private PostsRepository: PostsRepository,
  ) {}

  async execute(command: UpdatePostCommand): Promise<ResultDTO<null>> {
    const result = await this.BlogsService.validatePostData(
      command.blogId,
      command.postId,
      command.userId,
    );

    await result.payload.postInstance.changeData(
      command.title,
      command.shortDescription,
      command.content,
      command.blogId,
      result.payload.blogInstance.name,
    );

    return this.PostsRepository.save(result.payload.postInstance);
  }
}
