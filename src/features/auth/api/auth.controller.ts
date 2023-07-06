import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { RegistrationUserModel } from './models/input/RegistrationUserModel';
import { AuthService } from '../application/auth.service';
import { ConfirmRegistrationModel } from './models/input/ConfirmRegistrationModel';
import { ResendRegistrationModel } from './models/input/ResendRegistrationModel';
import { PasswordRecoveryModel } from './models/input/PasswordRecoveryModel';
import { UpdatePasswordModel } from './models/input/UpdatePasswordModel';
import { LoginModel } from './models/input/LoginModel';
import { Response } from 'express';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { JwtAccessAuthGuard } from '../guards/jwt-access-auth.guard';
import { CurrentUserId } from '../../infrastructure/decorators/params/current-user-id.param.decorator';
import { AuthQueryRepository } from '../infrastructure/auth.query-repository';
import { JwtRefreshAuthGuard } from '../guards/jwt-refresh-auth.guard';
import { RefreshTokenPayload } from '../../infrastructure/decorators/params/refresh-token-payload.param.decorator';
import { RefreshTokenPayloadType } from '../../infrastructure/decorators/params/types';
import { RateLimitGuard } from '../../rateLimit/guards/rateLimit.guard';
import { ExceptionAndResponseHelper } from '../../../shared/helpers';
import { ApproachType } from '../../../shared/enums';

@Controller('auth')
export class AuthController extends ExceptionAndResponseHelper {
  constructor(
    private AuthServices: AuthService,
    private AuthQueryRepository: AuthQueryRepository,
  ) {
    super(ApproachType.http);
  }

  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RateLimitGuard)
  async registration(@Body() inputModel: RegistrationUserModel): Promise<void> {
    const registrationResult = await this.AuthServices.registration(
      inputModel.login,
      inputModel.email,
      inputModel.password,
    );

    return this.sendExceptionOrResponse(registrationResult);
  }

  @Post('registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RateLimitGuard)
  async resendRegistration(
    @Body() inputModel: ResendRegistrationModel,
  ): Promise<void> {
    const resendingResult = await this.AuthServices.resendRegistration(
      inputModel.email,
    );

    return this.sendExceptionOrResponse(resendingResult);
  }

  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RateLimitGuard)
  async confirmRegistration(
    @Body() inputModel: ConfirmRegistrationModel,
  ): Promise<void> {
    const confirmResult = await this.AuthServices.confirmRegistration(
      inputModel.code,
    );

    return this.sendExceptionOrResponse(confirmResult);
  }

  @Post('password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RateLimitGuard)
  async passwordRecovery(
    @Body() inputMode: PasswordRecoveryModel,
  ): Promise<void> {
    const recoverResult = await this.AuthServices.passwordRecovery(
      inputMode.email,
    );

    return this.sendExceptionOrResponse(recoverResult);
  }

  @Post('new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RateLimitGuard)
  async confirmRecoveryPassword(
    @Body() inputModel: UpdatePasswordModel,
  ): Promise<void> {
    const confirmedResult = await this.AuthServices.confirmRecoveryPassword(
      inputModel.newPassword,
      inputModel.recoveryCode,
    );

    return this.sendExceptionOrResponse(confirmedResult);
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @UseGuards(RateLimitGuard)
  async login(
    @Headers('user-agent') deviceName: string,
    @Body() inputModel: LoginModel,
    @Ip() ip: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string }> {
    const loginResult = await this.AuthServices.login(
      inputModel.loginOrEmail,
      inputModel.password,
      deviceName,
      ip,
    );
    this.sendExceptionOrResponse(loginResult);

    res.cookie('refreshToken', loginResult.payload.refreshToken, {
      httpOnly: true,
      secure: true,
    });
    return { accessToken: loginResult.payload.accessToken };
  }

  @Get('me')
  @UseGuards(JwtAccessAuthGuard)
  async getMe(
    @CurrentUserId() currentUserId: string,
  ): Promise<{ email: string; login: string; userId: string }> {
    const userResult = await this.AuthQueryRepository.findMe(currentUserId);

    return this.sendExceptionOrResponse(userResult);
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshAuthGuard)
  async refreshSession(
    @CurrentUserId() currentUserId: string,
    @RefreshTokenPayload() refreshTokenPayload: RefreshTokenPayloadType,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string }> {
    const refreshResult = await this.AuthServices.refreshSession(
      currentUserId,
      refreshTokenPayload.deviceId,
      refreshTokenPayload.iat,
    );
    this.sendExceptionOrResponse(refreshResult);

    res.cookie('refreshToken', refreshResult.payload.refreshToken, {
      httpOnly: true,
      secure: true,
    });
    return { accessToken: refreshResult.payload.accessToken };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtRefreshAuthGuard)
  async logout(
    @CurrentUserId() currentUserId: string,
    @RefreshTokenPayload() refreshTokenPayload: RefreshTokenPayloadType,
  ): Promise<void> {
    const logoutResult = await this.AuthServices.logout(
      currentUserId,
      refreshTokenPayload.deviceId,
      refreshTokenPayload.iat,
    );

    return this.sendExceptionOrResponse(logoutResult);
  }
}
