import { Injectable } from '@nestjs/common';
import { Device, DeviceModelType } from '../domain/devices.entity';
import { InjectModel } from '@nestjs/mongoose';
import { DevicesRepository } from '../infrastructure/devices.repository';
import { Types } from 'mongoose';

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
  ): Promise<string> {
    const deviceInstance = await this.DeviceModel.makeInstance(
      userId,
      ip,
      deviceName,
      this.DeviceModel,
    );

    return this.DeviceRepository.create(deviceInstance);
  }

  async updateSessionTime(deviceId: string): Promise<boolean> {
    const deviceInstance = await this.DeviceRepository.findById(deviceId);
    if (!deviceInstance) return false;

    deviceInstance.updateSession();

    return this.DeviceRepository.save(deviceInstance);
  }

  /*async deleteAllUserSessions(
    userId: string,
    deviceId: string,
  ): Promise<boolean> {}*/
}
