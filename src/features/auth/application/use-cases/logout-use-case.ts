import { ResultDTO } from '../../../../shared/dto';
import { InternalCode } from '../../../../shared/enums';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DevicesQueryRepository } from '../../../devices/infrastructure/devices.query-repository';
import { DeleteUserSessionCommand } from '../../../devices/application/use-cases/delete-user-session-use-case';

export class LogoutCommand {
  constructor(
    public userId: string,
    public deviceId: string,
    public iat: number,
  ) {}
}

@CommandHandler(LogoutCommand)
export class LogoutUseCase implements ICommandHandler<LogoutCommand> {
  constructor(
    private CommandBus: CommandBus,
    private DeviceQueryRepository: DevicesQueryRepository,
  ) {}

  async execute(command: LogoutCommand): Promise<ResultDTO<null>> {
    const deviceResult = await this.DeviceQueryRepository.findDeviceById(
      command.deviceId,
    );
    if (deviceResult.hasError())
      return new ResultDTO(InternalCode.Unauthorized);

    if (
      deviceResult.payload.userId !== +command.userId ||
      command.iat !== Math.trunc(+deviceResult.payload.issuedAt / 1000)
    )
      return new ResultDTO(InternalCode.Unauthorized);

    return this.CommandBus.execute(
      new DeleteUserSessionCommand(command.deviceId),
    );
  }
}
