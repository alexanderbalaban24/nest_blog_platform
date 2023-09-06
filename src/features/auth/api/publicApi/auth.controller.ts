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
import { RegistrationUserModel } from '../models/input/RegistrationUserModel';
import { AuthService } from '../../application/auth.service';
import { ConfirmRegistrationModel } from '../models/input/ConfirmRegistrationModel';
import { ResendRegistrationModel } from '../models/input/ResendRegistrationModel';
import { PasswordRecoveryModel } from '../models/input/PasswordRecoveryModel';
import { UpdatePasswordModel } from '../models/input/UpdatePasswordModel';
import { LoginModel } from '../models/input/LoginModel';
import { Response } from 'express';
import { LocalAuthGuard } from '../../guards/local-auth.guard';
import { JwtAccessAuthGuard } from '../../guards/jwt-access-auth.guard';
import { CurrentUserId } from '../../../infrastructure/decorators/params/current-user-id.param.decorator';
import { AuthQueryRepository } from '../../infrastructure/auth.query-repository';
import { JwtRefreshAuthGuard } from '../../guards/jwt-refresh-auth.guard';
import { RefreshTokenPayload } from '../../../infrastructure/decorators/params/refresh-token-payload.param.decorator';
import { RefreshTokenPayloadType } from '../../../infrastructure/decorators/params/types';
import { ExceptionAndResponseHelper } from '../../../../shared/helpers';
import { ApproachType } from '../../../../shared/enums';
import { CommandBus } from '@nestjs/cqrs';
import { RegistrationCommand } from '../../application/use-cases/registration-use.case';
import { ResendingEmailRegistrationCommand } from '../../application/use-cases/resending-email-registration-use-case';
import { PasswordRecoveryCommand } from '../../application/use-cases/password-recovery-use-case';
import { ConfirmRegistrationCommand } from '../../application/use-cases/confirm-registration-use-case';
import { ConfirmRecoveryPasswordCommand } from '../../application/use-cases/confirm-recovery-password-use-case';
import { LoginCommand } from '../../application/use-cases/login-use-case';
import { RefreshSessionCommand } from '../../application/use-cases/refresh-session-use-case';
import { LogoutCommand } from '../../application/use-cases/logout-use-case';
import { ThrottlerGuard } from '@nestjs/throttler';

@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController extends ExceptionAndResponseHelper {
  constructor(
    private CommandBus: CommandBus,
    private AuthServices: AuthService,
    private AuthQueryRepository: AuthQueryRepository,
  ) {
    super(ApproachType.http);
  }

  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registration(@Body() inputModel: RegistrationUserModel): Promise<void> {
    const registrationResult = await this.CommandBus.execute(
      new RegistrationCommand(
        inputModel.login,
        inputModel.email,
        inputModel.password,
      ),
    );

    return this.sendExceptionOrResponse(registrationResult);
  }

  @Post('registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  async resendRegistration(
    @Body() inputModel: ResendRegistrationModel,
  ): Promise<void> {
    const resendingResult = await this.CommandBus.execute(
      new ResendingEmailRegistrationCommand(inputModel.email),
    );

    return this.sendExceptionOrResponse(resendingResult);
  }

  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async confirmRegistration(
    @Body() inputModel: ConfirmRegistrationModel,
  ): Promise<void> {
    const confirmResult = await this.CommandBus.execute(
      new ConfirmRegistrationCommand(inputModel.code),
    );

    return this.sendExceptionOrResponse(confirmResult);
  }

  @Post('password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  async passwordRecovery(
    @Body() inputMode: PasswordRecoveryModel,
  ): Promise<void> {
    const recoverResult = await this.CommandBus.execute(
      new PasswordRecoveryCommand(inputMode.email),
    );

    return this.sendExceptionOrResponse(recoverResult);
  }

  @Post('new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async confirmRecoveryPassword(
    @Body() inputModel: UpdatePasswordModel,
  ): Promise<void> {
    const confirmedResult = await this.CommandBus.execute(
      new ConfirmRecoveryPasswordCommand(
        inputModel.newPassword,
        inputModel.recoveryCode,
      ),
    );

    return this.sendExceptionOrResponse(confirmedResult);
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  //@Throttle({ default: { limit: 2, ttl: 10000 } })
  @HttpCode(HttpStatus.OK)
  async login(
    @Headers('user-agent') deviceName: string,
    @Body() inputModel: LoginModel,
    @Ip() ip: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string }> {
    const loginResult = await this.CommandBus.execute(
      new LoginCommand(
        inputModel.loginOrEmail,
        inputModel.password,
        deviceName,
        ip,
      ),
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
    const refreshResult = await this.CommandBus.execute(
      new RefreshSessionCommand(
        currentUserId,
        refreshTokenPayload.deviceId,
        refreshTokenPayload.iat,
      ),
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
    const logoutResult = await this.CommandBus.execute(
      new LogoutCommand(
        currentUserId,
        refreshTokenPayload.deviceId,
        refreshTokenPayload.iat,
      ),
    );

    return this.sendExceptionOrResponse(logoutResult);
  }
}
