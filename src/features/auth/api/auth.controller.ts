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
  UnauthorizedException,
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

@Controller('auth')
export class AuthController {
  constructor(
    private authServices: AuthService,
    private authQueryRepository: AuthQueryRepository,
  ) {}

  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registration(@Body() inputModel: RegistrationUserModel) {
    return this.authServices.registration(
      inputModel.login,
      inputModel.email,
      inputModel.password,
    );
  }

  @Post('registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  async resendRegistration(@Body() inputModel: ResendRegistrationModel) {
    return this.authServices.resendRegistration(inputModel.email);
  }

  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async confirmRegistration(@Body() inputModel: ConfirmRegistrationModel) {
    return this.authServices.confirmRegistration(inputModel.code);
  }

  @Post('password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  async passwordRecovery(@Body() inputMode: PasswordRecoveryModel) {
    return this.authServices.passwordRecovery(inputMode.email);
  }

  @Post('new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async confirmRecoveryPassword(@Body() inputModel: UpdatePasswordModel) {
    return this.authServices.confirmRecoveryPassword(
      inputModel.newPassword,
      inputModel.recoveryCode,
    );
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  async login(
    @Headers('user-agent') deviceName: string,
    @Body() inputModel: LoginModel,
    @Ip() ip: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string }> {
    const tokenPair = await this.authServices.login(
      inputModel.loginOrEmail,
      inputModel.password,
      deviceName,
      ip,
    );
    if (!tokenPair) throw new UnauthorizedException();

    res.cookie('refreshToken', tokenPair.refreshToken, {
      httpOnly: true,
      secure: true,
    });
    return { accessToken: tokenPair.accessToken };
  }

  @Get('me')
  @UseGuards(JwtAccessAuthGuard)
  async getMe(@CurrentUserId() currentUserId: string) {
    return this.authQueryRepository.findMe(currentUserId);
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshAuthGuard)
  async refreshSession(
    @CurrentUserId() currentUserId: string,
    @RefreshTokenPayload() refreshTokenPayload: RefreshTokenPayloadType,
  ) {
    console.log(refreshTokenPayload);
    return false;
  }
}
