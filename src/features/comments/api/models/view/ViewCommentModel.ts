import { LikeStatusEnum } from '../../../../../shared/enums';

export type ViewCommentModel = {
  id: string;
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  createdAt: Date;
  likesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: LikeStatusEnum;
  };
};
