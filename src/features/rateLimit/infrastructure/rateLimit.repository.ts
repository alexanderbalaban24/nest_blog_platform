import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  RateLimit,
  RateLimitDocument,
  RateLimitModelType,
} from '../domain/rateLimit.entity';

@Injectable()
export class RateLimitRepository {
  constructor(
    @InjectModel(RateLimit.name) private RateLimitModel: RateLimitModelType,
  ) {}

  async getCountAttemptsByIPAndUrl(
    ip: string,
    url: string,
    limitInterval: Date,
  ): Promise<number> {
    return this.RateLimitModel.find({
      ip,
      url,
      date: { $gte: limitInterval },
    }).count();
  }

  async save(rateLimitInstance: RateLimitDocument): Promise<boolean> {
    await rateLimitInstance.save();

    return true;
  }
}
