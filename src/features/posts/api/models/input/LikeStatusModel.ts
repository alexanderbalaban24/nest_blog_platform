import { LikeStatusEnum } from '../../../../../shared/enums';
import { IsIn, IsString } from 'class-validator';

export class LikeStatusModel {
  @IsString()
  @IsIn(Object.values(LikeStatusEnum))
  likeStatus: LikeStatusEnum;
}
