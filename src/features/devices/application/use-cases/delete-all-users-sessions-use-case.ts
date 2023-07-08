import { DevicesRepository } from '../../infrastructure/devices.repository';
import { ResultDTO } from '../../../../shared/dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class DeleteAllUsersSessionsCommand {
  constructor(public userId: string, public deviceId: string) {}
}

@CommandHandler(DeleteAllUsersSessionsCommand)
export class DeleteAllUsersSessionsUseCase
  implements ICommandHandler<DeleteAllUsersSessionsCommand>
{
  constructor(private DeviceRepository: DevicesRepository) {}

  async execute(
    command: DeleteAllUsersSessionsCommand,
  ): Promise<ResultDTO<null>> {
    return this.DeviceRepository.deleteAllDevices(
      command.userId,
      command.deviceId,
    );
  }
}
