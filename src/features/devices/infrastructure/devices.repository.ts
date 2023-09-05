import { Injectable } from '@nestjs/common';
import { ResultDTO } from '../../../shared/dto';
import { InternalCode } from '../../../shared/enums';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Equal, Not, Repository } from 'typeorm';
import { Device } from '../entities/device.entity';

@Injectable()
export class DevicesRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(Device) private deviceRepo: Repository<Device>,
  ) {}

  async create(device: Device): Promise<ResultDTO<{ deviceId: string }>> {
    const res = await this.deviceRepo.save(device);

    return new ResultDTO(InternalCode.Success, { deviceId: res.id });
  }

  async save(device: Device): Promise<ResultDTO<null>> {
    await this.deviceRepo.save(device);

    return new ResultDTO(InternalCode.Success);
  }

  async delete(userId: string): Promise<ResultDTO<null>> {
    await this.deviceRepo.delete({ userId: +userId });

    return new ResultDTO(InternalCode.Success);
  }

  async deleteById(deviceId: string): Promise<ResultDTO<null>> {
    await this.deviceRepo.delete(deviceId);

    return new ResultDTO(InternalCode.Success);
  }

  async deleteAllDevicesExcludeCurrent(
    userId: string,
    excludeId: string,
  ): Promise<ResultDTO<null>> {
    await this.deviceRepo.delete({
      userId: +userId,
      id: Not(Equal(excludeId)),
    });

    return new ResultDTO(InternalCode.Success);
  }

  async findById(deviceId: string): Promise<ResultDTO<Device>> {
    const device = await this.deviceRepo.findOneBy({ id: deviceId });
    if (!device?.id) return new ResultDTO(InternalCode.NotFound);

    return new ResultDTO(InternalCode.Success, device);
  }
}
