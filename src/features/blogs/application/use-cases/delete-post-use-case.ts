import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ResultDTO } from '../../../../shared/dto';
import { InternalCode } from '../../../../shared/enums';
import { BlogsService } from '../blogs.service';

export class DeletePostCommand {
  constructor(
    public blogId: string,
    public postId: string,
    public userId: string,
  ) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand> {
  constructor(private BlogsService: BlogsService) {}

  async execute(command: DeletePostCommand): Promise<ResultDTO<null>> {
    const result = await this.BlogsService.validatePostData(
      command.blogId,
      command.postId,
      command.userId,
    );
    if (result.hasError()) return result as ResultDTO<null>;

    await result.payload.postInstance.deleteOne();

    return new ResultDTO(InternalCode.Success);
  }
}
