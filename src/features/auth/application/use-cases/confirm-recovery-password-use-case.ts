import { ResultDTO } from '../../../../shared/dto';
import { genSalt, hash } from 'bcrypt';
import { AuthRepository } from '../../infrastructure/auth.repository';
import { AuthQueryRepository } from '../../infrastructure/auth.query-repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class ConfirmRecoveryPasswordCommand {
  constructor(public newPassword: string, public code: string) {}
}

@CommandHandler(ConfirmRecoveryPasswordCommand)
export class ConfirmRecoveryPasswordUseCase
  implements ICommandHandler<ConfirmRecoveryPasswordCommand>
{
  constructor(
    private AuthRepository: AuthRepository,
    private AuthQueryRepository: AuthQueryRepository,
  ) {}

  async execute(
    command: ConfirmRecoveryPasswordCommand,
  ): Promise<ResultDTO<null>> {
    const userIdResult =
      await this.AuthQueryRepository.findUserByConfirmationCode(command.code);
    if (userIdResult.hasError()) return userIdResult as ResultDTO<null>;

    const userInstanceResult = await this.AuthRepository.findById(
      userIdResult.payload.userId,
    );
    if (userInstanceResult.hasError())
      return userInstanceResult as ResultDTO<null>;
    // TODO раунд должен храниться в env
    const passwordSalt = await genSalt(10);
    const passwordHash = await hash(command.newPassword, passwordSalt);

    userInstanceResult.payload.updatePasswordHash(passwordHash);
    return this.AuthRepository.save(userInstanceResult.payload);
  }
}
