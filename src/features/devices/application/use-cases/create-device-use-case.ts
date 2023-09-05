import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ResultDTO } from '../../../../shared/dto';
import { DevicesRepository } from '../../infrastructure/devices.repository';
import { Device } from '../../entities/device.entity';

export class CreateDeviceCommand {
  constructor(
    public userId: number,
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
    const device = new Device();
    device.userId = command.userId;
    device.ip = command.ip;
    device.deviceName = command.deviceName;
    device.issuedAt = new Date();

    return this.DeviceRepository.create(device);
  }
}
