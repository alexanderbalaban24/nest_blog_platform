import { ResultDTO } from '../../../../shared/dto';
import { compare } from 'bcrypt';
import { InternalCode } from '../../../../shared/enums';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthRepository } from '../../infrastructure/auth.repository';

export class ValidateUserCommand {
  constructor(public loginOrEmail: string, public password: string) {}
}

@CommandHandler(ValidateUserCommand)
export class ValidateUserUseCase
  implements ICommandHandler<ValidateUserCommand>
{
  constructor(private AuthRepository: AuthRepository) {}

  async execute(command: ValidateUserCommand): Promise<ResultDTO<null>> {
    const userResult = await this.AuthRepository.findByCredentials(
      command.loginOrEmail,
    );
    if (userResult.hasError()) return userResult as ResultDTO<null>;

    const isValidUser = await compare(
      command.password,
      userResult.payload.passwordHash,
    );
    if (!isValidUser || userResult.payload.ban.isBanned)
      return new ResultDTO(InternalCode.Unauthorized);

    return new ResultDTO(InternalCode.Success);
  }
}
