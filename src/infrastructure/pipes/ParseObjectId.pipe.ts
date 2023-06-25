import {
  ArgumentMetadata,
  Injectable,
  NotFoundException,
  PipeTransform,
} from '@nestjs/common';
import { Types } from 'mongoose';

@Injectable()
export class ParseObjectIdPipe implements PipeTransform {
  async transform(value: string, metadata: ArgumentMetadata) {
    try {
      return Types.ObjectId.createFromHexString(value);
    } catch (e) {
      throw new NotFoundException();
    }
  }
}
