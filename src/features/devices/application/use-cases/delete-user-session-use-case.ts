import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ResultDTO } from '../../../../shared/dto';
import { InternalCode } from '../../../../shared/enums';
import { DevicesRepository } from '../../infrastructure/devices.repository';

export class DeleteUserSessionCommand {
  constructor(public deviceId: string) {}
}

@CommandHandler(DeleteUserSessionCommand)
export class DeleteUserSessionUseCase
  implements ICommandHandler<DeleteUserSessionCommand>
{
  constructor(private DeviceRepository: DevicesRepository) {}

  async execute(command: DeleteUserSessionCommand): Promise<ResultDTO<null>> {
    return this.DeviceRepository.deleteById(command.deviceId);
  }
}
