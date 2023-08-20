import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DevicesRepository } from '../../../devices/infrastructure/devices.repository';
import { ResultDTO } from '../../../../shared/dto';
import { InternalCode } from '../../../../shared/enums';
import { UsersRepository } from '../../infrastructure/users.repository';

export class BanUnbanCommand {
  constructor(
    public userId: string,
    public isBanned: boolean,
    public banReason: string,
  ) {}
}

@CommandHandler(BanUnbanCommand)
export class BanUnbanUseCase implements ICommandHandler<BanUnbanCommand> {
  constructor(
    private DevicesRepository: DevicesRepository,
    private UsersRepository: UsersRepository,
  ) {}

  async execute(command: BanUnbanCommand): Promise<ResultDTO<null>> {
    // Delete all devices
    if (command.isBanned) {
      const deleteDevicesResult = await this.DevicesRepository.deleteAllDevices(
        command.userId,
      );
      if (deleteDevicesResult.hasError())
        return new ResultDTO(InternalCode.Internal_Server);
    }

    const banReason = command.isBanned ? command.banReason : null;
    const banDate = command.isBanned ? new Date() : null;

    await this.UsersRepository.banUser(
      command.userId,
      command.isBanned,
      banReason,
      banDate,
    );
    return new ResultDTO(InternalCode.Success);
  }
}
