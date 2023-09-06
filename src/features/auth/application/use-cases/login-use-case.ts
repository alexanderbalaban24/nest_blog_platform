import { ResultDTO } from '../../../../shared/dto';
import { TokenPair } from '../../../../shared/types';
import { InternalCode } from '../../../../shared/enums';
import { compare } from 'bcrypt';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { CreateDeviceCommand } from '../../../devices/application/use-cases/create-device-use-case';
import { UsersRepository } from '../../../users/infrastructure/users/users.repository';

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
    private commandBus: CommandBus,
    private usersRepository: UsersRepository,
    private jwtService: JwtService,
  ) {}

  async execute(command: LoginCommand): Promise<ResultDTO<TokenPair>> {
    const userResult = await this.usersRepository.findByCredentials(
      command.loginOrEmail,
    );
    if (userResult.hasError() || userResult.payload?.ban?.isBanned)
      return new ResultDTO(InternalCode.Unauthorized);

    const isValidCredentials = await compare(
      command.password,
      userResult.payload.passwordHash,
    );
    if (!isValidCredentials) return new ResultDTO(InternalCode.Unauthorized);

    const createdDeviceResult = await this.commandBus.execute(
      new CreateDeviceCommand(
        userResult.payload.id,
        command.ip,
        command.deviceName,
      ),
    );
    if (createdDeviceResult.hasError())
      return createdDeviceResult as ResultDTO<null>;

    const accessToken = await this.jwtService.signAsync(
      { userId: userResult.payload.id },
      { expiresIn: '10s' },
    );
    const refreshToken = await this.jwtService.signAsync(
      {
        userId: userResult.payload.id,
        deviceId: createdDeviceResult.payload.deviceId,
      },
      { expiresIn: '20s' },
    );

    return new ResultDTO(InternalCode.Success, { accessToken, refreshToken });
  }
}
