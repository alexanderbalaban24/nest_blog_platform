import { LikeStatusEnum } from './enums';

export type QueryDataType = {
  banStatus?: 'all' | 'banned' | 'notBanned';
  sortBy?: string;
  sortDirection?: string;
  pageNumber?: string;
  pageSize?: string;
  searchLoginTerm?: string;
  searchEmailTerm?: string;
  searchNameTerm?: string;
};

export type UserLikeType = {
  userId: string;
  login: string;
  likeStatus: LikeStatusEnum;
  addedAt: Date;
};

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
};
