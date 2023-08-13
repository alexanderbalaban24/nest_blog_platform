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
    const sessionsRaw = await this.dataSource.query(
      `
    SELECT *
    FROM "users_devices" as ud
    WHERE ud."userId" = $1
    `,
      [userId],
    );

    if (!sessionsRaw.length) return new ResultDTO(InternalCode.NotFound);

    const sessionsData = sessionsRaw.map((session) => ({
      ip: session.ip,
      title: session.deviceName,
      lastActiveDate: new Date(session.issuedAt).toISOString(),
      deviceId: session.id,
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
