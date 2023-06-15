import { LikeStatusEnum } from '../../../../../shared/enums';
import { UserLikeType } from '../../../../../shared/types';

type ExtendedLikesInfoType = {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatusEnum;
  newestLikes: UserLikeType[];
};

export type ViewPostModel = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: ExtendedLikesInfoType;
};
