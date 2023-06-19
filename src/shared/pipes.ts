import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { Types } from 'mongoose';

@Injectable()
export class ParseObjectIdPipe implements PipeTransform {
  transform(value: string, metadata: ArgumentMetadata) {
    try {
      const parsedId = Types.ObjectId.createFromHexString(value);
      return parsedId;
    } catch (e) {
      throw new Error('Incorrect ID');
    }
  }
}
