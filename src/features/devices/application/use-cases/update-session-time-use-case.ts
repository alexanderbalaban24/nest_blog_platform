import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DevicesRepository } from '../../infrastructure/devices.repository';
import { ResultDTO } from '../../../../shared/dto';

export class UpdateSessionTimeCommand {
  constructor(public deviceId: string) {}
}

@CommandHandler(UpdateSessionTimeCommand)
export class UpdateSessionTimeUseCase
  implements ICommandHandler<UpdateSessionTimeCommand>
{
  constructor(private DeviceRepository: DevicesRepository) {}

  async execute(command: UpdateSessionTimeCommand): Promise<ResultDTO<null>> {
    return this.DeviceRepository.updateSessionTime(
      command.deviceId,
      new Date(),
    );
  }
}
