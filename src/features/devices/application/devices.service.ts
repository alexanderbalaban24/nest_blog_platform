import { Injectable } from '@nestjs/common';
import { Device, DeviceModelType } from '../domain/devices.entity';
import { InjectModel } from '@nestjs/mongoose';
import { DevicesRepository } from '../infrastructure/devices.repository';
import { Types } from 'mongoose';

@Injectable()
export class DevicesService {
  constructor(
    @InjectModel(Device.name) private DeviceModel: DeviceModelType,
    private deviceRepository: DevicesRepository,
  ) {}

  async createDevice(
    userId: Types.ObjectId,
    ip: string,
    deviceName: string,
  ): Promise<Types.ObjectId> {
    const deviceInstance = await this.DeviceModel.makeInstance(
      userId,
      ip,
      deviceName,
      this.DeviceModel,
    );

    return this.deviceRepository.create(deviceInstance);
  }
}
