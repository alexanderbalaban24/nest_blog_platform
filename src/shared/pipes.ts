import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { Types } from 'mongoose';

@Injectable()
export class ParseObjectIdPipe implements PipeTransform {
  transform(value: string, metadata: ArgumentMetadata) {
    try {
      return Types.ObjectId.createFromHexString(value);
    } catch (e) {
      throw new Error('Incorrect ID');
    }
  }
}
