import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { CurrentUserId } from '../../infrastructure/decorators/params/current-user-id.param.decorator';
import { DevicesQueryRepository } from '../infrastructure/devices.query-repository';

@Controller('security/devices')
export class DevicesController {
  constructor(private DeviceQueryRepository: DevicesQueryRepository) {}

  @Get()
  async getAllDevices(@CurrentUserId() currentUserId: string) {
    const activeSessions =
      this.DeviceQueryRepository.findDeviceByUserId(currentUserId);
    if (!activeSessions) throw new NotFoundException();

    return activeSessions;
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAllDevices() {}

  @Delete(':id')
  async deleteDevice(@Param('id') deviceId: string) {}
}
