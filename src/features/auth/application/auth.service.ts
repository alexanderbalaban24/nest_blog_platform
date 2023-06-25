import { Injectable } from '@nestjs/common';
import { UsersService } from '../../users/application/users.service';
import { BusinessService } from '../../email/application/business.service';
import { EmailEvents } from '../../../shared/enums';
import { AuthQueryRepository } from '../infrastructure/auth.query-repository';
import { AuthRepository } from '../infrastructure/auth.repository';
import { compare, genSalt, hash } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { DevicesService } from '../../devices/application/devices.service';
import { TokenPair } from '../../../shared/types';
import { DevicesQueryRepository } from '../../devices/infrastructure/devices.query-repository';

@Injectable()
export class AuthService {
  constructor(
    private UsersService: UsersService,
    private BusinessService: BusinessService,
    private AuthQueryRepository: AuthQueryRepository,
    private AuthRepository: AuthRepository,
    private JwtService: JwtService,
    private DevicesService: DevicesService,
    private DeviceQueryRepository: DevicesQueryRepository,
  ) {}

  async registration(
    login: string,
    email: string,
    password: string,
  ): Promise<boolean> {
    const createdUserId = await this.UsersService.createUser(
      login,
      email,
      password,
      false,
    );
    if (!createdUserId) return false;

    const confirmationData =
      await this.AuthQueryRepository.findUserWithConfirmationDataById(
        createdUserId,
      );

    const result = await this.BusinessService.doOperation(
      EmailEvents.Registration,
      email,
      confirmationData.confirmationCode,
    );

    if (!result) {
      await this.UsersService.deleteUser(createdUserId);
    }

    return result;
  }

  async resendRegistration(email: string): Promise<boolean> {
    const userInstance = await this.AuthRepository.findByCredentials(email);
    if (!userInstance) return false;

    const confirmationCode =
      userInstance.updateConfirmationOrRecoveryData('emailConfirmation');
    const isSaved = await this.AuthRepository.save(userInstance);
    if (!isSaved) return false;

    return await this.BusinessService.doOperation(
      EmailEvents.Registration,
      email,
      confirmationCode,
    );
  }

  async passwordRecovery(email: string): Promise<boolean> {
    const userInstance = await this.AuthRepository.findByCredentials(email);
    if (!userInstance) return false;

    const confirmationCode =
      userInstance.updateConfirmationOrRecoveryData('passwordRecovery');
    const isSaved = await this.AuthRepository.save(userInstance);
    if (!isSaved) return false;

    return await this.BusinessService.doOperation(
      EmailEvents.Recover_password,
      email,
      confirmationCode,
    );
  }

  async confirmRegistration(code: string): Promise<boolean> {
    const userId = await this.AuthQueryRepository.findUserByConfirmationCode(
      code,
    );
    if (!userId) return false;

    const userInstance = await this.AuthRepository.findById(userId);
    if (!userInstance) return false;

    userInstance.confirmAccount();

    return this.AuthRepository.save(userInstance);
  }

  async confirmRecoveryPassword(
    newPassword: string,
    code: string,
  ): Promise<boolean> {
    const userId = await this.AuthQueryRepository.findUserByConfirmationCode(
      code,
    );
    if (!userId) return false;

    const userInstance = await this.AuthRepository.findById(userId);
    if (!userInstance) return false;
    // TODO раунд должен храниться в env
    const passwordSalt = await genSalt(10);
    const passwordHash = await hash(newPassword, passwordSalt);

    userInstance.updatePasswordHash(passwordHash);
    return this.AuthRepository.save(userInstance);
  }

  async login(
    loginOrEmail: string,
    password: string,
    deviceName: string,
    ip: string,
  ): Promise<TokenPair> {
    const user = await this.AuthRepository.findByCredentials(loginOrEmail);
    if (!user) return null;

    const isValidCredentials = await compare(password, user.passwordHash);
    if (!isValidCredentials) return null;

    const createdDeviceId = await this.DevicesService.createDevice(
      user._id.toString(),
      ip,
      deviceName,
    );
    if (!createdDeviceId) return null;

    const accessToken = await this.JwtService.signAsync(
      { userId: user.id },
      { expiresIn: '10s' },
    );
    const refreshToken = await this.JwtService.signAsync(
      {
        userId: user.id,
        deviceId: createdDeviceId,
      },
      { expiresIn: '20s' },
    );

    return { accessToken, refreshToken };
  }

  async refreshSession(
    userId: string,
    deviceId: string,
    iat: number,
  ): Promise<TokenPair> {
    const deviceInfo = await this.DeviceQueryRepository.findDeviceById(
      deviceId,
    );
    if (!deviceInfo) return null;

    if (
      deviceInfo.userId !== userId ||
      iat !== Math.trunc(+deviceInfo.issuedAt / 1000)
    )
      return null;

    await this.DevicesService.updateSessionTime(deviceId);
    const accessToken = await this.JwtService.signAsync(
      { userId: userId },
      { expiresIn: '10s' },
    );
    const refreshToken = await this.JwtService.signAsync(
      {
        userId: userId,
        deviceId,
      },
      { expiresIn: '20s' },
    );

    return { accessToken, refreshToken };
  }

  async validateUser(loginOrEmail: string, password: string): Promise<boolean> {
    const user = await this.AuthRepository.findByCredentials(loginOrEmail);
    if (!user) return false;

    const isValidUser = await compare(password, user.passwordHash);
    if (!isValidUser) return false;

    return true;
  }
}
