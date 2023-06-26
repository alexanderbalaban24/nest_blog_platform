import {
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CurrentUserId } from '../../infrastructure/decorators/params/current-user-id.param.decorator';
import { DevicesQueryRepository } from '../infrastructure/devices.query-repository';
import { RefreshTokenPayload } from '../../infrastructure/decorators/params/refresh-token-payload.param.decorator';
import { RefreshTokenPayloadType } from '../../infrastructure/decorators/params/types';
import { JwtRefreshAuthGuard } from '../../auth/guards/jwt-refresh-auth.guard';
import { DevicesService } from '../application/devices.service';
import { ExistingDevicePipe } from '../../../infrastructure/pipes/ExistingDevice.pipe';

@Controller('security/devices')
export class DevicesController {
  constructor(
    private DevicesQueryRepository: DevicesQueryRepository,
    private DevicesService: DevicesService,
  ) {}

  @Get()
  @UseGuards(JwtRefreshAuthGuard)
  async getAllDevices(@CurrentUserId() currentUserId: string) {
    const activeSessions = await this.DevicesQueryRepository.findDeviceByUserId(
      currentUserId,
    );
    console.log(activeSessions);
    if (!activeSessions) throw new NotFoundException();

    return activeSessions;
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtRefreshAuthGuard)
  async deleteAllDevices(
    @CurrentUserId() currentUserId: string,
    @RefreshTokenPayload() refreshTokenPayload: RefreshTokenPayloadType,
  ) {
    return this.DevicesService.deleteAllUserSessions(
      currentUserId,
      refreshTokenPayload.deviceId,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtRefreshAuthGuard)
  async deleteDevice(
    @Param('id', ExistingDevicePipe) deviceId: string,
    @CurrentUserId() currentUserId: string,
  ) {
    const deviceInfo = await this.DevicesQueryRepository.findDeviceById(
      deviceId,
    );
    if (currentUserId !== deviceInfo.userId) {
      throw new ForbiddenException();
    }

    return this.DevicesService.deleteUserSession(deviceId);
  }
}
