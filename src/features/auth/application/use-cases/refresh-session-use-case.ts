import { ResultDTO } from '../../../../shared/dto';
import { TokenPair } from '../../../../shared/types';
import { InternalCode } from '../../../../shared/enums';
import { DevicesQueryRepository } from '../../../devices/infrastructure/devices.query-repository';
import { JwtService } from '@nestjs/jwt';
import { AuthRepository } from '../../infrastructure/auth.repository';
import { AuthQueryRepository } from '../../infrastructure/auth.query-repository';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateSessionTimeCommand } from '../../../devices/application/use-cases/update-session-time-use-case';

export class RefreshSessionCommand {
  constructor(
    public userId: string,
    public deviceId: string,
    public iat: number,
  ) {}
}

@CommandHandler(RefreshSessionCommand)
export class RefreshSessionUseCase
  implements ICommandHandler<RefreshSessionCommand>
{
  constructor(
    private CommandBus: CommandBus,
    private JwtService: JwtService,
    private DeviceQueryRepository: DevicesQueryRepository,
  ) {}

  async execute(command: RefreshSessionCommand): Promise<ResultDTO<TokenPair>> {
    const deviceResult = await this.DeviceQueryRepository.findDeviceById(
      command.deviceId,
    );
    if (deviceResult.hasError())
      return new ResultDTO(InternalCode.Unauthorized);

    if (
      deviceResult.payload.userId !== command.userId ||
      command.iat !== Math.trunc(+deviceResult.payload.issuedAt / 1000)
    )
      return new ResultDTO(InternalCode.Unauthorized);

    const updatedTimeResult = await this.CommandBus.execute(
      new UpdateSessionTimeCommand(command.deviceId),
    );
    if (updatedTimeResult.hasError()) return updatedTimeResult;

    const accessToken = await this.JwtService.signAsync(
      { userId: command.userId },
      { expiresIn: '10s' },
    );
    const refreshToken = await this.JwtService.signAsync(
      {
        userId: command.userId,
        deviceId: command.deviceId,
      },
      { expiresIn: '20s' },
    );

    return new ResultDTO(InternalCode.Success, { accessToken, refreshToken });
  }
}
