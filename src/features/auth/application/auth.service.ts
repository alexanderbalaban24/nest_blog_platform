import { Injectable } from '@nestjs/common';
import { UsersService } from '../../users/application/users.service';
import { BusinessService } from '../../email/application/business.service';
import { EmailEvents } from '../../../shared/enums';
import { AuthQueryRepository } from '../infrastructure/auth.query-repository';
import { AuthRepository } from '../infrastructure/auth.repository';
import { genSalt, hash } from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private businessService: BusinessService,
    private authQueryRepository: AuthQueryRepository,
    private authRepository: AuthRepository,
  ) {}

  async registration(
    login: string,
    email: string,
    password: string,
  ): Promise<boolean> {
    const createdUserId = await this.usersService.createUser(
      login,
      email,
      password,
      false,
    );
    if (!createdUserId) return false;

    const confirmationData =
      await this.authQueryRepository.findUserWithConfirmationDataById(
        createdUserId,
      );

    const result = await this.businessService.doOperation(
      EmailEvents.Registration,
      email,
      confirmationData.confirmationCode,
    );

    if (!result) {
      await this.usersService.deleteUser(createdUserId);
    }

    return result;
  }

  async resendRegistration(email: string): Promise<boolean> {
    const userInstance = await this.authRepository.findByCredentials(email);
    if (!userInstance) return false;

    const confirmationCode =
      userInstance.updateConfirmationOrRecoveryData('emailConfirmation');
    const isSaved = await this.authRepository.save(userInstance);
    if (!isSaved) return false;

    return await this.businessService.doOperation(
      EmailEvents.Registration,
      email,
      confirmationCode,
    );
  }

  async passwordRecovery(email: string): Promise<boolean> {
    const userInstance = await this.authRepository.findByCredentials(email);
    if (!userInstance) return false;

    const confirmationCode =
      userInstance.updateConfirmationOrRecoveryData('passwordRecovery');
    const isSaved = await this.authRepository.save(userInstance);
    if (!isSaved) return false;

    return await this.businessService.doOperation(
      EmailEvents.Recover_password,
      email,
      confirmationCode,
    );
  }

  async confirmRegistration(code: string): Promise<boolean> {
    const userId = await this.authQueryRepository.findUserByConfirmationCode(
      code,
    );
    if (!userId) return false;

    const userInstance = await this.authRepository.findById(userId);
    if (!userInstance) return false;

    userInstance.confirmAccount();

    return this.authRepository.save(userInstance);
  }

  async confirmRecoveryPassword(
    newPassword: string,
    code: string,
  ): Promise<boolean> {
    const userId = await this.authQueryRepository.findUserByConfirmationCode(
      code,
    );
    if (!userId) return false;

    const userInstance = await this.authRepository.findById(userId);
    if (!userInstance) return false;
    // TODO раунд должен храниться в env
    const passwordSalt = await genSalt(10);
    const passwordHash = await hash(newPassword, passwordSalt);

    userInstance.updatePasswordHash(passwordHash);
    return this.authRepository.save(userInstance);
  }
}
