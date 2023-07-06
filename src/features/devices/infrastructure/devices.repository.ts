import { Injectable } from '@nestjs/common';
import {
  Device,
  DeviceDocument,
  DeviceModelType,
} from '../domain/devices.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { ResultDTO } from '../../../shared/dto';
import { InternalCode } from '../../../shared/enums';

@Injectable()
export class DevicesRepository {
  constructor(@InjectModel(Device.name) private DeviceModel: DeviceModelType) {}

  async deleteAllDevices(
    userId: string,
    excludeId: string,
  ): Promise<ResultDTO<null>> {
    await this.DeviceModel.deleteMany({
      userId,
      _id: { $ne: new Types.ObjectId(excludeId) },
    });

    return new ResultDTO(InternalCode.Success);
  }

  async findById(deviceId: string): Promise<ResultDTO<DeviceDocument>> {
    const deviceInstance = await this.DeviceModel.findById(deviceId);
    if (!deviceInstance) return new ResultDTO(InternalCode.NotFound);

    return new ResultDTO(InternalCode.Success, deviceInstance);
  }

  async create(
    deviceInstance: DeviceDocument,
  ): Promise<ResultDTO<{ deviceId: string }>> {
    const createdDevice = await deviceInstance.save();

    return new ResultDTO(InternalCode.Success, {
      deviceId: createdDevice._id.toString(),
    });
  }

  async save(deviceInstance: DeviceDocument): Promise<ResultDTO<null>> {
    await deviceInstance.save();

    return new ResultDTO(InternalCode.Success);
  }
}
