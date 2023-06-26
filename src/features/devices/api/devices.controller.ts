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

@Controller('security/devices')
export class DevicesController {
  constructor(
    private DevicesQueryRepository: DevicesQueryRepository,
    private DevicesService: DevicesService,
  ) {}

  @Get()
  async getAllDevices(@CurrentUserId() currentUserId: string) {
    const activeSessions =
      this.DevicesQueryRepository.findDeviceByUserId(currentUserId);
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
    @Param('id') deviceId: string,
    @RefreshTokenPayload() refreshTokenPayload: RefreshTokenPayloadType,
  ) {
    if (deviceId !== refreshTokenPayload.deviceId)
      throw new ForbiddenException();

    return this.DevicesService.deleteUserSession(deviceId);
  }
}
