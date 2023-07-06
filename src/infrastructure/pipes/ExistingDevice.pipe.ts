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
    const deviceResult = await this.DevicesRepository.findById(value);
    if (deviceResult.hasError()) throw new NotFoundException();
    console.log(deviceResult);
    return deviceResult.payload._id.toString();
  }
}
