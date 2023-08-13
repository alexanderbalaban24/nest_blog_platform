import { ResultDTO } from '../../../../shared/dto';
import { TokenPair } from '../../../../shared/types';
import { InternalCode } from '../../../../shared/enums';
import { compare } from 'bcrypt';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthRepository } from '../../infrastructure/auth.repository';
import { JwtService } from '@nestjs/jwt';
import { CreateDeviceCommand } from '../../../devices/application/use-cases/create-device-use-case';

export class LoginCommand {
  constructor(
    public loginOrEmail: string,
    public password: string,
    public deviceName: string,
    public ip: string,
  ) {}
}

@CommandHandler(LoginCommand)
export class LoginUseCase implements ICommandHandler<LoginCommand> {
  constructor(
    private CommandBus: CommandBus,
    private AuthRepository: AuthRepository,
    private JwtService: JwtService,
  ) {}

  async execute(command: LoginCommand): Promise<ResultDTO<TokenPair>> {
    const userResult = await this.AuthRepository.findByCredentials(
      command.loginOrEmail,
    );
    if (userResult.hasError()) return new ResultDTO(InternalCode.Unauthorized);

    const isValidCredentials = await compare(
      command.password,
      userResult.payload.passwordHash,
    );
    if (!isValidCredentials) return new ResultDTO(InternalCode.Unauthorized);

    const createdDeviceResult = await this.CommandBus.execute(
      new CreateDeviceCommand(
        userResult.payload.id,
        command.ip,
        command.deviceName,
      ),
    );
    if (createdDeviceResult.hasError())
      return createdDeviceResult as ResultDTO<null>;

    const accessToken = await this.JwtService.signAsync(
      { userId: userResult.payload.id },
      { expiresIn: '5m' },
    );
    const refreshToken = await this.JwtService.signAsync(
      {
        userId: userResult.payload.id,
        deviceId: createdDeviceResult.payload.deviceId,
      },
      { expiresIn: '10m' },
    );

    return new ResultDTO(InternalCode.Success, { accessToken, refreshToken });
  }
}
