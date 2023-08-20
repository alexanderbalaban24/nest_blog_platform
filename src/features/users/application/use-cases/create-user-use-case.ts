import { ResultDTO } from '../../../../shared/dto';
import { genSalt, hash } from 'bcrypt';
import { UsersRepository } from '../../infrastructure/users.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import add from 'date-fns/add';
import { GlobalConfigService } from '../../../../config/globalConfig.service';

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
    private UsersRepository: UsersRepository,
    private configService: GlobalConfigService,
  ) {}

  async execute(
    command: CreateUserCommand,
  ): Promise<ResultDTO<{ userId: string }>> {
    const round = this.configService.getRound();
    const passwordSalt = await genSalt(+round);
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
