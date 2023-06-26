import {
  ArgumentMetadata,
  Injectable,
  NotFoundException,
  PipeTransform,
} from '@nestjs/common';
import { DevicesRepository } from '../../features/devices/infrastructure/devices.repository';

@Injectable()
export class ExistingDevicePipe implements PipeTransform {
  constructor(private DevicesRepository: DevicesRepository) {}

  async transform(value: string, metadata: ArgumentMetadata) {
    const user = await this.DevicesRepository.findById(value);
    if (!user) throw new NotFoundException();

    return user._id.toString();
  }
}
