import { LikeStatusEnum } from '../../../../../shared/enums';
import { IsIn, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class LikeStatusModel {
  @IsString()
  @Transform(({ value }) => value.trim())
  @IsIn(Object.values(LikeStatusEnum))
  likeStatus: LikeStatusEnum;
}
