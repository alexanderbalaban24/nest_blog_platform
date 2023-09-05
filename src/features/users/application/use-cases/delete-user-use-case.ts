import { ResultDTO } from '../../../../shared/dto';
import { UsersRepository } from '../../infrastructure/users/users.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class DeleteUserCommand {
  constructor(public userId: string) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase implements ICommandHandler<DeleteUserCommand> {
  constructor(private UsersRepository: UsersRepository) {}

  async execute(command: DeleteUserCommand): Promise<ResultDTO<null>> {
    return this.UsersRepository.deleteById(command.userId);
  }
}
