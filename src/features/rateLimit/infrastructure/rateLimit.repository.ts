import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  RateLimit,
  RateLimitDocument,
  RateLimitModelType,
} from '../domain/rateLimit.entity';
import { ResultDTO } from '../../../shared/dto';
import { InternalCode } from '../../../shared/enums';

@Injectable()
export class RateLimitRepository {
  constructor(
    @InjectModel(RateLimit.name) private RateLimitModel: RateLimitModelType,
  ) {}

  async getCountAttemptsByIPAndUrl(
    ip: string,
    url: string,
    limitInterval: Date,
  ): Promise<ResultDTO<{ count: number }>> {
    const count = await this.RateLimitModel.find({
      ip,
      url,
      date: { $gte: limitInterval },
    }).count();

    return new ResultDTO(InternalCode.Success, { count });
  }

  async save(rateLimitInstance: RateLimitDocument): Promise<ResultDTO<null>> {
    await rateLimitInstance.save();

    return new ResultDTO(InternalCode.Success);
  }
}
