import { ResultDTO } from '../../../../shared/dto';
import { genSalt, hash } from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserModelType } from '../../domain/users.entity';
import { UsersRepository } from '../../infrastructure/users.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class CreateUserCommand {
  constructor(
    public login: string,
    public email: string,
    public password: string,
    public isConfirmed: boolean,
  ) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand> {
  constructor(
    @InjectModel(User.name) private UserModel: UserModelType,
    private UsersRepository: UsersRepository,
  ) {}

  //TODO количество раундов должно сидеть в env
  async execute(
    command: CreateUserCommand,
  ): Promise<ResultDTO<{ userId: string }>> {
    const passwordSalt = await genSalt(10);
    const passwordHash = await hash(command.password, passwordSalt);

    const newUserInstance = this.UserModel.makeInstance(
      command.login,
      command.email,
      passwordHash,
      command.isConfirmed,
      this.UserModel,
    );
    return this.UsersRepository.create(newUserInstance);
  }
}
