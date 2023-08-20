import { ResultDTO } from '../../../../shared/dto';
import { genSalt, hash } from 'bcrypt';
import { AuthRepository } from '../../infrastructure/auth.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthAction } from '../../../../shared/enums';
import { GlobalConfigService } from '../../../../config/globalConfig.service';

export class ConfirmRecoveryPasswordCommand {
  constructor(public newPassword: string, public code: string) {}
}

@CommandHandler(ConfirmRecoveryPasswordCommand)
export class ConfirmRecoveryPasswordUseCase
  implements ICommandHandler<ConfirmRecoveryPasswordCommand>
{
  constructor(
    private AuthRepository: AuthRepository,
    private configService: GlobalConfigService,
  ) {}

  async execute(
    command: ConfirmRecoveryPasswordCommand,
  ): Promise<ResultDTO<null>> {
    const userResult = await this.AuthRepository.findByConfirmationCode(
      command.code,
      AuthAction.Recovery,
    );
    if (userResult.hasError()) return userResult as ResultDTO<null>;

    const round = this.configService.getRound();
    const passwordSalt = await genSalt(+round);
    const passwordHash = await hash(command.newPassword, passwordSalt);

    return this.AuthRepository.updatePasswordHash(
      userResult.payload.userId,
      passwordHash,
    );
  }
}
