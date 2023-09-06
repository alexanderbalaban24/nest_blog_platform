import { ResultDTO } from '../../../../shared/dto';
import { compare } from 'bcrypt';
import { InternalCode } from '../../../../shared/enums';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../users/infrastructure/users/users.repository';

export class ValidateUserCommand {
  constructor(public loginOrEmail: string, public password: string) {}
}

@CommandHandler(ValidateUserCommand)
export class ValidateUserUseCase
  implements ICommandHandler<ValidateUserCommand>
{
  constructor(private usersRepository: UsersRepository) {}

  async execute(command: ValidateUserCommand): Promise<ResultDTO<null>> {
    const userResult = await this.usersRepository.findByCredentials(
      command.loginOrEmail,
    );
    if (userResult.hasError()) return userResult as ResultDTO<null>;

    const isValidUser = await compare(
      command.password,
      userResult.payload.passwordHash,
    );
    if (!isValidUser || userResult.payload?.ban?.isBanned)
      return new ResultDTO(InternalCode.Unauthorized);

    return new ResultDTO(InternalCode.Success);
  }
}
