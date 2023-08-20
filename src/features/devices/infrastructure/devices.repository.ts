import { Injectable } from '@nestjs/common';
import { ResultDTO } from '../../../shared/dto';
import { InternalCode } from '../../../shared/enums';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class DevicesRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async createDevice(
    userId: string,
    ip: string,
    deviceName: string,
    issuedAt: Date,
  ): Promise<ResultDTO<{ deviceId: string }>> {
    const devices = await this.dataSource.query(
      `
    INSERT INTO "users_devices" as ud
    ("userId", "ip", "deviceName", "issuedAt")
    VALUES($1, $2, $3, $4)
    RETURNING "id" as "deviceId"
    `,
      [userId, ip, deviceName, issuedAt],
    );
    console.log(devices);
    return new ResultDTO(InternalCode.Success, devices[0]);
  }

  async updateSessionTime(
    deviceId: string,
    newSessionTime: Date,
  ): Promise<ResultDTO<null>> {
    await this.dataSource.query(
      `
    UPDATE "users_devices"
    SET "issuedAt" = $1
    WHERE "id" = $2
    `,
      [newSessionTime, deviceId],
    );

    return new ResultDTO(InternalCode.Success);
  }

  async deleteById(deviceId: string): Promise<ResultDTO<null>> {
    await this.dataSource.query(
      `
    DELETE FROM "users_devices" as ud
    WHERE ud."id" = $1
    `,
      [deviceId],
    );

    return new ResultDTO(InternalCode.Success);
  }

  async deleteAllDevicesExcludeCurrent(
    userId: string,
    excludeId: string,
  ): Promise<ResultDTO<null>> {
    await this.dataSource.query(
      `
    DELETE FROM "users_devices" as ud
    WHERE ud."userId" = $1 AND
    ud."id" != $2
    `,
      [userId, excludeId],
    );

    return new ResultDTO(InternalCode.Success);
  }

  async deleteAllDevices(userId: string): Promise<ResultDTO<null>> {
    await this.dataSource.query(
      `
    DELETE FROM "users_devices" as ud
    WHERE ud."userId" = $1
    `,
      [userId],
    );

    return new ResultDTO(InternalCode.Success);
  }

  async findById(deviceId: string): Promise<ResultDTO<any>> {
    const deviceRaw = await this.dataSource.query(
      `
    SELECT *
    FROM "users_devices" AS ud
    WHERE ud."id" = $1
    `,
      [deviceId],
    );
    if (!deviceRaw.length) return new ResultDTO(InternalCode.NotFound);

    return new ResultDTO(InternalCode.Success, deviceRaw[0]);
  }
}
