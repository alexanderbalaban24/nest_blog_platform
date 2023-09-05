import { ResultDTO } from '../../../../shared/dto';
import { genSalt, hash } from 'bcrypt';
import { UsersRepository } from '../../infrastructure/users/users.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import add from 'date-fns/add';
import { GlobalConfigService } from '../../../../config/globalConfig.service';
import { User } from '../../entities/user.entity';

export class CreateUserCommand {
  constructor(
    public login: string,
    public email: string,
    public password: string,
  ) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand> {
  constructor(
    private usersRepository: UsersRepository,
    private configService: GlobalConfigService,
  ) {}

  async execute(
    command: CreateUserCommand,
  ): Promise<ResultDTO<{ userId: string }>> {
    const round = this.configService.getRound();
    const passwordSalt = await genSalt(+round);
    const passwordHash = await hash(command.password, passwordSalt);

    const user = new User();
    user.login = command.login;
    user.email = command.email;
    user.passwordHash = passwordHash;

    return this.usersRepository.create(user);
  }
}
