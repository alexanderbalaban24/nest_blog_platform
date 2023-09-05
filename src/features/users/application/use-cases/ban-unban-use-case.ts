import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DevicesRepository } from '../../../devices/infrastructure/devices.repository';
import { ResultDTO } from '../../../../shared/dto';
import { InternalCode } from '../../../../shared/enums';
import { UsersRepository } from '../../infrastructure/users/users.repository';
import { UserBan } from '../../entities/user-ban.entity';
import { BansRepository } from '../../infrastructure/bans/bans.repository';

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
    private devicesRepository: DevicesRepository,
    private usersRepository: UsersRepository,
    private bansRepository: BansRepository,
  ) {}

  async execute(command: BanUnbanCommand): Promise<ResultDTO<null>> {
    // Delete all device
    if (command.isBanned) {
      const deleteDevicesResult = await this.devicesRepository.delete(
        command.userId,
      );
      if (deleteDevicesResult.hasError())
        return new ResultDTO(InternalCode.Internal_Server);
    }

    const ban = new UserBan();
    ban.userId = +command.userId;
    ban.banDate = command.isBanned ? new Date() : null;
    ban.banReason = command.isBanned ? command.banReason : null;
    ban.isBanned = command.isBanned;

    await this.bansRepository.save(ban);
    return new ResultDTO(InternalCode.Success);
  }
}
