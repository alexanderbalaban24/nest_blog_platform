import {
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
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
import { ExceptionAndResponseHelper } from '../../../shared/helpers';
import { ApproachType } from '../../../shared/enums';
import { ViewDeviceModel } from './models/view/ViewDeviceModel';
import { DeleteUserSessionCommand } from '../application/use-cases/delete-user-session-use-case';
import { CommandBus } from '@nestjs/cqrs';
import { DeleteAllUsersSessionsCommand } from '../application/use-cases/delete-all-users-sessions-use-case';

@Controller('security/devices')
export class DevicesController extends ExceptionAndResponseHelper {
  constructor(
    private CommandBus: CommandBus,
    private DevicesQueryRepository: DevicesQueryRepository,
  ) {
    super(ApproachType.http);
  }

  @Get()
  @UseGuards(JwtRefreshAuthGuard)
  async getAllDevices(
    @CurrentUserId() currentUserId: string,
  ): Promise<ViewDeviceModel[]> {
    const activeSessionsResult =
      await this.DevicesQueryRepository.findDeviceByUserId(currentUserId);

    return this.sendExceptionOrResponse(activeSessionsResult);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtRefreshAuthGuard)
  async deleteAllDevices(
    @CurrentUserId() currentUserId: string,
    @RefreshTokenPayload() refreshTokenPayload: RefreshTokenPayloadType,
  ): Promise<void> {
    const deletedResult = await this.CommandBus.execute(
      new DeleteAllUsersSessionsCommand(
        currentUserId,
        refreshTokenPayload.deviceId,
      ),
    );

    return this.sendExceptionOrResponse(deletedResult);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtRefreshAuthGuard)
  async deleteDevice(
    @Param('id', ExistingDevicePipe) deviceId: string,
    @CurrentUserId() currentUserId: string,
  ): Promise<void> {
    const deviceResult = await this.DevicesQueryRepository.findDeviceById(
      deviceId,
    );
    if (currentUserId !== deviceResult.payload.userId) {
      throw new ForbiddenException();
    }

    const deletedResult = await this.CommandBus.execute(
      new DeleteUserSessionCommand(deviceId),
    );

    return this.sendExceptionOrResponse(deletedResult);
  }
}
