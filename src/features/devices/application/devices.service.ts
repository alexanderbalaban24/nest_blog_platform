import { Injectable } from '@nestjs/common';
import { Device, DeviceModelType } from '../domain/devices.entity';
import { InjectModel } from '@nestjs/mongoose';
import { DevicesRepository } from '../infrastructure/devices.repository';
import { ResultDTO } from '../../../shared/dto';
import { InternalCode } from '../../../shared/enums';

@Injectable()
export class DevicesService {
  constructor(
    @InjectModel(Device.name) private DeviceModel: DeviceModelType,
    private DeviceRepository: DevicesRepository,
  ) {}

  async createDevice(
    userId: string,
    ip: string,
    deviceName: string,
  ): Promise<ResultDTO<{ deviceId: string }>> {
    const deviceInstance = await this.DeviceModel.makeInstance(
      userId,
      ip,
      deviceName,
      this.DeviceModel,
    );

    return this.DeviceRepository.create(deviceInstance);
  }

  async updateSessionTime(deviceId: string): Promise<ResultDTO<null>> {
    const deviceResult = await this.DeviceRepository.findById(deviceId);
    if (deviceResult.hasError()) return deviceResult as ResultDTO<null>;

    deviceResult.payload.updateSession();

    return this.DeviceRepository.save(deviceResult.payload);
  }

  async deleteAllUserSessions(
    userId: string,
    deviceId: string,
  ): Promise<ResultDTO<null>> {
    return this.DeviceRepository.deleteAllDevices(userId, deviceId);
  }

  async deleteUserSession(deviceId: string): Promise<ResultDTO<null>> {
    const deviceResult = await this.DeviceRepository.findById(deviceId);
    if (deviceResult.hasError()) return deviceResult as ResultDTO<null>;

    await deviceResult.payload.deleteOne();

    return new ResultDTO(InternalCode.Success);
  }
}
