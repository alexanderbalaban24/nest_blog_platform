import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { RateLimit, RateLimitModelType } from '../domain/rateLimit.entity';
import { RateLimitRepository } from '../infrastructure/rateLimit.repository';
import { sub } from 'date-fns';
import { ResultDTO } from '../../../shared/dto';

@Injectable()
export class RateLimitService {
  constructor(
    @InjectModel(RateLimit.name) private RateLimitModel: RateLimitModelType,
    private RateLimitRepository: RateLimitRepository,
  ) {}

  async addAttempt(ip: string, url: string): Promise<ResultDTO<null>> {
    const newAttempt = this.RateLimitModel.makeInstance(
      ip,
      url,
      this.RateLimitModel,
    );

    return this.RateLimitRepository.save(newAttempt);
  }

  async getCountAttempts(
    ip: string,
    url: string,
  ): Promise<ResultDTO<{ count: number }>> {
    const limitInterval = sub(new Date(), { seconds: 10 });

    return this.RateLimitRepository.getCountAttemptsByIPAndUrl(
      ip,
      url,
      limitInterval,
    );
  }
}
