import { ResultDTO } from '../../../../shared/dto';
import { genSalt, hash } from 'bcrypt';
import { UsersRepository } from '../../infrastructure/users.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import add from 'date-fns/add';

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
  constructor(private UsersRepository: UsersRepository) {}

  //TODO количество раундов должно сидеть в env
  async execute(
    command: CreateUserCommand,
  ): Promise<ResultDTO<{ userId: string }>> {
    const passwordSalt = await genSalt(10);
    const passwordHash = await hash(command.password, passwordSalt);
    const expirationDate = add(new Date(), { hours: 3 });

    return this.UsersRepository.createUser(
      command.login,
      command.email,
      passwordHash,
      command.isConfirmed,
      expirationDate,
    );
  }
}
