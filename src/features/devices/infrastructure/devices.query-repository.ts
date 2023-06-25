import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Device, DeviceModelType } from '../domain/devices.entity';
import { CurrentUserId } from '../../infrastructure/decorators/params/current-user-id.param.decorator';

@Injectable()
export class DevicesQueryRepository {
  constructor(@InjectModel(Device.name) private DeviceModel: DeviceModelType) {}

  async findDeviceByUserId(userId: string) {
    const sessions = await this.DeviceModel.find({ userId }).lean();

    return sessions.map((session) => ({
      ip: session.ip,
      title: session.deviceName,
      lastActiveDate: session.issuedAt.toISOString(),
      deviceId: session._id.toString(),
    }));
  }

  async findDeviceById(deviceId: string) {
    const device = await this.DeviceModel.findById(deviceId);
    if (!device) return null;

    return {
      id: device._id.toString(),
      userId: device.userId,
      deviceName: device.deviceName,
      ip: device.ip,
      issuedAt: device.issuedAt,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  findDevice(@CurrentUserId() currentUserId: string) {}
}
