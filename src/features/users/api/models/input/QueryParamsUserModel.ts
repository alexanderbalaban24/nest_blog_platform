export class QueryParamsUserModel {
  banStatus: 'all' | 'banned' | 'notBanned';
  sortBy?: string;
  sortDirection?: 'desc' | 'asc';
  pageNumber?: string;
  pageSize?: string;
  searchLoginTerm?: string;
  searchEmailTerm?: string;
}
