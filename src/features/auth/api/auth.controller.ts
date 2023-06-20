import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { RegistrationUserModel } from './models/input/RegistrationUserModel';
import { AuthService } from '../application/auth.service';
import { ConfirmRegistrationModel } from './models/input/ConfirmRegistrationModel';
import { ResendRegistrationModel } from './models/input/ResendRegistrationModel';
import { PasswordRecoveryModel } from './models/input/PasswordRecoveryModel';
import { UpdatePasswordModel } from './models/input/UpdatePasswordModel';

@Controller('auth')
export class AuthController {
  constructor(private authServices: AuthService) {}

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
}
