import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ResultDTO } from '../../../../shared/dto';
import { BlogModelType, Blog } from '../../domain/blogs.entity';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { InjectModel } from '@nestjs/mongoose';

export class CreateBlogCommand {
  constructor(
    public name: string,
    public description: string,
    public websiteUrl: string,
  ) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
  constructor(
    @InjectModel(Blog.name) private BlogModel: BlogModelType,
    private BlogsRepository: BlogsRepository,
  ) {}

  async execute(
    command: CreateBlogCommand,
  ): Promise<ResultDTO<{ blogId: string }>> {
    const newBlogInstance = this.BlogModel.makeInstance(
      command.name,
      command.description,
      command.websiteUrl,
      this.BlogModel,
    );

    return this.BlogsRepository.create(newBlogInstance);
  }
}
