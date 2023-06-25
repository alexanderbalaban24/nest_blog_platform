import { Injectable } from '@nestjs/common';
import {
  Device,
  DeviceDocument,
  DeviceModelType,
} from '../domain/devices.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Injectable()
export class DevicesRepository {
  constructor(@InjectModel(Device.name) private DeviceModel: DeviceModelType) {}

  async findById(deviceId: string): Promise<DeviceDocument> {
    return this.DeviceModel.findById(deviceId);
  }

  async create(deviceInstance: DeviceDocument): Promise<string> {
    const createdDevice = await deviceInstance.save();

    return createdDevice._id.toString();
  }

  async save(deviceInstance: DeviceDocument): Promise<boolean> {
    await deviceInstance.save();

    return true;
  }
}
