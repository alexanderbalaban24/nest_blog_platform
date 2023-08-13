import { BanStatus } from '../../../../../shared/enums';

export class QueryParamsUserModel {
  banStatus: BanStatus;
  sortBy?: string;
  sortDirection?: 'desc' | 'asc';
  pageNumber?: string;
  pageSize?: string;
  searchLoginTerm?: string;
  searchEmailTerm?: string;
}
