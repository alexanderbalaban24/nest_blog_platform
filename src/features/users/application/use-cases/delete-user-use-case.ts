import { InjectModel } from '@nestjs/mongoose';
import { User, UserModelType } from '../../domain/users.entity';
import { ResultDTO } from '../../../../shared/dto';
import { InternalCode } from '../../../../shared/enums';
import { UsersRepository } from '../../infrastructure/users.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class DeleteUserCommand {
  constructor(public userId: string) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase implements ICommandHandler<DeleteUserCommand> {
  constructor(
    @InjectModel(User.name) private UserModel: UserModelType,
    private UsersRepository: UsersRepository,
  ) {}

  async execute(command: DeleteUserCommand): Promise<ResultDTO<null>> {
    return this.UsersRepository.deleteById(command.userId);
  }
}
