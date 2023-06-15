import { QueryBuildDTO } from './dto';
import { LikeStatusEnum } from './enums';

export type QueryDataType = {
  sortBy?: string;
  sortDirection?: string;
  pageNumber?: string;
  pageSize?: string;
  searchLoginTerm?: string;
  searchEmailTerm?: string;
  searchNameTerm?: string;
};

export type QueryCustomMethods = {
  findWithQuery<T, C>(
    queryData: QueryDataType,
    id?: string,
  ): Promise<QueryBuildDTO<T, C>>;
};

export type UserLikeType = {
  userId: string;
  login: string;
  likeStatus: LikeStatusEnum;
  addedAt: Date;
};
