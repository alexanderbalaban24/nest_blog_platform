import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ResultDTO } from '../../../../shared/dto';
import { InjectModel } from '@nestjs/mongoose';
import { Device, DeviceModelType } from '../../domain/devices.entity';
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
  constructor(
    @InjectModel(Device.name) private DeviceModel: DeviceModelType,
    private DeviceRepository: DevicesRepository,
  ) {}

  async execute(
    command: CreateDeviceCommand,
  ): Promise<ResultDTO<{ deviceId: string }>> {
    const deviceInstance = await this.DeviceModel.makeInstance(
      command.userId,
      command.ip,
      command.deviceName,
      this.DeviceModel,
    );

    return this.DeviceRepository.create(deviceInstance);
  }
}
