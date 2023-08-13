import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Device, DeviceModelType } from '../domain/devices.entity';
import { ResultDTO } from '../../../shared/dto';
import { ViewDeviceModel } from '../api/models/view/ViewDeviceModel';
import { InternalCode } from '../../../shared/enums';

@Injectable()
export class DevicesQueryRepository {
  constructor(@InjectModel(Device.name) private DeviceModel: DeviceModelType) {}

  async findDeviceByUserId(
    userId: string,
  ): Promise<ResultDTO<ViewDeviceModel[]>> {
    const sessions = await this.DeviceModel.find({ userId }).lean();

    const sessionsData = sessions.map((session) => ({
      ip: session.ip,
      title: session.deviceName,
      lastActiveDate: session.issuedAt.toISOString(),
      deviceId: session._id.toString(),
    }));

    return new ResultDTO(InternalCode.Success, sessionsData);
  }

  async findDeviceById(deviceId: string): Promise<
    ResultDTO<{
      id: string;
      userId: string;
      deviceName: string;
      ip: string;
      issuedAt: Date;
    }>
  > {
    const device = await this.DeviceModel.findById(deviceId);
    if (!device) return new ResultDTO(InternalCode.NotFound);

    const deviceData = {
      id: device._id.toString(),
      userId: device.userId,
      deviceName: device.deviceName,
      ip: device.ip,
      issuedAt: device.issuedAt,
    };

    return new ResultDTO(InternalCode.Success, deviceData);
  }
}
