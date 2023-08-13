import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Device, DeviceModelType } from '../domain/devices.entity';
import { ResultDTO } from '../../../shared/dto';
import { ViewDeviceModel } from '../api/models/view/ViewDeviceModel';
import { InternalCode } from '../../../shared/enums';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class DevicesQueryRepository {
  constructor(
    @InjectModel(Device.name) private DeviceModel: DeviceModelType,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

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
    const devices = await this.dataSource.query(
      `
    SELECT *
    FROM "users_devices" as ud
    WHERE ud."id" = $1
    `,
      [deviceId],
    );
    if (!devices.length) return new ResultDTO(InternalCode.NotFound);

    return new ResultDTO(InternalCode.Success, devices[0]);
  }
}
