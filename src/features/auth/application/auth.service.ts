import { Injectable } from '@nestjs/common';
import { UsersService } from '../../users/application/users.service';
import { BusinessService } from '../../email/application/business.service';
import { EmailEvents, InternalCode } from '../../../shared/enums';
import { AuthQueryRepository } from '../infrastructure/auth.query-repository';
import { AuthRepository } from '../infrastructure/auth.repository';
import { compare, genSalt, hash } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { DevicesService } from '../../devices/application/devices.service';
import { TokenPair } from '../../../shared/types';
import { DevicesQueryRepository } from '../../devices/infrastructure/devices.query-repository';
import { ResultDTO } from '../../../shared/dto';

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
  ): Promise<ResultDTO<null>> {
    const createdUserId = await this.UsersService.createUser(
      login,
      email,
      password,
      false,
    );
    if (createdUserId.hasError())
      return new ResultDTO(InternalCode.Internal_Server);

    const confirmationResult =
      await this.AuthQueryRepository.findUserWithConfirmationDataById(
        createdUserId.payload.userId,
      );

    const result = await this.BusinessService.doOperation(
      EmailEvents.Registration,
      email,
      confirmationResult.payload.confirmationCode,
    );

    if (result.hasError()) {
      await this.UsersService.deleteUser(createdUserId.payload.userId);
    }

    return result;
  }

  async resendRegistration(email: string): Promise<ResultDTO<null>> {
    const userResult = await this.AuthRepository.findByCredentials(email);
    if (userResult.hasError()) return userResult as ResultDTO<null>;

    const confirmationCode =
      userResult.payload.updateConfirmationOrRecoveryData('emailConfirmation');
    const savedResult = await this.AuthRepository.save(userResult.payload);
    if (savedResult.hasError()) return savedResult;

    return await this.BusinessService.doOperation(
      EmailEvents.Registration,
      email,
      confirmationCode,
    );
  }

  async passwordRecovery(email: string): Promise<ResultDTO<null>> {
    const userResult = await this.AuthRepository.findByCredentials(email);
    if (userResult.hasError()) return userResult as ResultDTO<null>;

    const confirmationCode =
      userResult.payload.updateConfirmationOrRecoveryData('passwordRecovery');
    const savedResult = await this.AuthRepository.save(userResult.payload);
    if (savedResult.hasError()) return savedResult;

    return await this.BusinessService.doOperation(
      EmailEvents.Recover_password,
      email,
      confirmationCode,
    );
  }

  async confirmRegistration(code: string): Promise<ResultDTO<null>> {
    const userIdResult =
      await this.AuthQueryRepository.findUserByConfirmationCode(code);
    if (userIdResult.hasError()) return userIdResult as ResultDTO<null>;

    const userInstanceResult = await this.AuthRepository.findById(
      userIdResult.payload.userId,
    );
    if (userInstanceResult.hasError())
      return userInstanceResult as ResultDTO<null>;

    userInstanceResult.payload.confirmAccount();

    return this.AuthRepository.save(userInstanceResult.payload);
  }

  async confirmRecoveryPassword(
    newPassword: string,
    code: string,
  ): Promise<ResultDTO<null>> {
    const userIdResult =
      await this.AuthQueryRepository.findUserByConfirmationCode(code);
    if (userIdResult.hasError()) return userIdResult as ResultDTO<null>;

    const userInstanceResult = await this.AuthRepository.findById(
      userIdResult.payload.userId,
    );
    if (userInstanceResult.hasError())
      return userInstanceResult as ResultDTO<null>;
    // TODO раунд должен храниться в env
    const passwordSalt = await genSalt(10);
    const passwordHash = await hash(newPassword, passwordSalt);

    userInstanceResult.payload.updatePasswordHash(passwordHash);
    return this.AuthRepository.save(userInstanceResult.payload);
  }

  async login(
    loginOrEmail: string,
    password: string,
    deviceName: string,
    ip: string,
  ): Promise<ResultDTO<TokenPair>> {
    const userResult = await this.AuthRepository.findByCredentials(
      loginOrEmail,
    );
    if (userResult.hasError()) return new ResultDTO(InternalCode.Unauthorized);

    const isValidCredentials = await compare(
      password,
      userResult.payload.passwordHash,
    );
    if (!isValidCredentials) return new ResultDTO(InternalCode.Unauthorized);

    const createdDeviceResult = await this.DevicesService.createDevice(
      userResult.payload._id.toString(),
      ip,
      deviceName,
    );
    if (createdDeviceResult.hasError())
      return createdDeviceResult as ResultDTO<null>;

    const accessToken = await this.JwtService.signAsync(
      { userId: userResult.payload.id },
      { expiresIn: '10s' },
    );
    const refreshToken = await this.JwtService.signAsync(
      {
        userId: userResult.payload.id,
        deviceId: createdDeviceResult.payload,
      },
      { expiresIn: '20s' },
    );

    return new ResultDTO(InternalCode.Success, { accessToken, refreshToken });
  }

  async refreshSession(
    userId: string,
    deviceId: string,
    iat: number,
  ): Promise<ResultDTO<TokenPair>> {
    const deviceResult = await this.DeviceQueryRepository.findDeviceById(
      deviceId,
    );
    if (deviceResult.hasError()) return deviceResult as ResultDTO<null>;

    if (
      deviceResult.payload.userId !== userId ||
      iat !== Math.trunc(+deviceResult.payload.issuedAt / 1000)
    )
      return new ResultDTO(InternalCode.Unauthorized);

    const updatedTimeResult = await this.DevicesService.updateSessionTime(
      deviceId,
    );
    if (updatedTimeResult.hasError()) return updatedTimeResult;

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

    return new ResultDTO(InternalCode.Success, { accessToken, refreshToken });
  }

  async logout(
    userId: string,
    deviceId: string,
    iat: number,
  ): Promise<ResultDTO<null>> {
    const deviceResult = await this.DeviceQueryRepository.findDeviceById(
      deviceId,
    );
    if (deviceResult.hasError()) return deviceResult as ResultDTO<null>;

    if (
      deviceResult.payload.userId !== userId ||
      iat !== Math.trunc(+deviceResult.payload.issuedAt / 1000)
    )
      return new ResultDTO(InternalCode.Unauthorized);

    return this.DevicesService.deleteUserSession(deviceId);
  }

  async validateUser(
    loginOrEmail: string,
    password: string,
  ): Promise<ResultDTO<null>> {
    const userResult = await this.AuthRepository.findByCredentials(
      loginOrEmail,
    );
    if (userResult.hasError()) return userResult as ResultDTO<null>;

    const isValidUser = await compare(
      password,
      userResult.payload.passwordHash,
    );
    if (!isValidUser) return new ResultDTO(InternalCode.Unauthorized);

    return new ResultDTO(InternalCode.Success);
  }
}
