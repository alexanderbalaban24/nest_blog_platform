import { DevicesRepository } from '../../infrastructure/devices.repository';
import { ResultDTO } from '../../../../shared/dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class DeleteAllUserSessionsExcludeCurrentCommand {
  constructor(public userId: string, public deviceId: string) {}
}

@CommandHandler(DeleteAllUserSessionsExcludeCurrentCommand)
export class DeleteAllUserSessionsExcludeCurrentUseCase
  implements ICommandHandler<DeleteAllUserSessionsExcludeCurrentCommand>
{
  constructor(private DeviceRepository: DevicesRepository) {}

  async execute(
    command: DeleteAllUserSessionsExcludeCurrentCommand,
  ): Promise<ResultDTO<null>> {
    return this.DeviceRepository.deleteAllDevicesExcludeCurrent(
      command.userId,
      command.deviceId,
    );
  }
}
