import { ResultDTO } from '../../../../shared/dto';
import { genSalt, hash } from 'bcrypt';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InternalCode } from '../../../../shared/enums';
import { GlobalConfigService } from '../../../../config/globalConfig.service';
import { PasswordRecoveryRepository } from '../../../users/infrastructure/password-recovery/password-recovery.repository';
import { UsersRepository } from '../../../users/infrastructure/users/users.repository';

export class ConfirmRecoveryPasswordCommand {
  constructor(public newPassword: string, public code: string) {}
}

@CommandHandler(ConfirmRecoveryPasswordCommand)
export class ConfirmRecoveryPasswordUseCase
  implements ICommandHandler<ConfirmRecoveryPasswordCommand>
{
  constructor(
    private usersRepository: UsersRepository,
    private passwordRecoveryRepository: PasswordRecoveryRepository,
    private configService: GlobalConfigService,
  ) {}

  async execute(
    command: ConfirmRecoveryPasswordCommand,
  ): Promise<ResultDTO<null>> {
    const userIdResult =
      await this.passwordRecoveryRepository.findByConfirmationCode(
        command.code,
      );
    if (userIdResult.hasError()) return userIdResult as ResultDTO<null>;

    const userResult = await this.usersRepository.findById(
      userIdResult.payload.userId,
    );
    if (userResult.hasError())
      return new ResultDTO(InternalCode.Internal_Server);

    const round = this.configService.getRound();
    const passwordSalt = await genSalt(+round);
    userResult.payload.passwordHash = await hash(
      command.newPassword,
      passwordSalt,
    );
    return this.usersRepository.save(userResult.payload);
  }
}
