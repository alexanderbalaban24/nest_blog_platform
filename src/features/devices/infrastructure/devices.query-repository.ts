import { Injectable } from '@nestjs/common';
import { ResultDTO } from '../../../shared/dto';
import { ViewDeviceModel } from '../api/models/view/ViewDeviceModel';
import { InternalCode } from '../../../shared/enums';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Device } from '../entities/device.entity';

@Injectable()
export class DevicesQueryRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(Device) private devicesRepo: Repository<Device>,
  ) {}

  async findDeviceByUserId(
    userId: string,
  ): Promise<ResultDTO<ViewDeviceModel[]>> {
    const sessions = await this.devicesRepo.find({
      where: { userId: +userId },
    });

    if (!sessions.length) return new ResultDTO(InternalCode.NotFound);

    const sessionsData = sessions.map((session) => ({
      ip: session.ip,
      title: session.deviceName,
      lastActiveDate: new Date(session.issuedAt).toISOString(),
      deviceId: session.id,
    }));

    return new ResultDTO(InternalCode.Success, sessionsData);
  }

  async findDeviceById(deviceId: string): Promise<ResultDTO<Device>> {
    const device = await this.devicesRepo.findOneBy({ id: deviceId });
    if (!device) return new ResultDTO(InternalCode.NotFound);

    return new ResultDTO(InternalCode.Success, device);
  }
}
