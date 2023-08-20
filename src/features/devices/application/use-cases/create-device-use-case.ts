import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ResultDTO } from '../../../../shared/dto';
import { DevicesRepository } from '../../infrastructure/devices.repository';

export class CreateDeviceCommand {
  constructor(
    public userId: string,
    public ip: string,
    public deviceName: string,
  ) {}
}

@CommandHandler(CreateDeviceCommand)
export class CreateDeviceUseCase
  implements ICommandHandler<CreateDeviceCommand>
{
  constructor(private DeviceRepository: DevicesRepository) {}

  async execute(
    command: CreateDeviceCommand,
  ): Promise<ResultDTO<{ deviceId: string }>> {
    return this.DeviceRepository.createDevice(
      command.userId,
      command.ip,
      command.deviceName,
      new Date(),
    );
  }
}
