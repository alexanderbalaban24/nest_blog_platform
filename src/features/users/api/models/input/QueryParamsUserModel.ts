import { IsString } from 'class-validator';

export class QueryParamsUserModel {
  sortBy?: string;
  sortDirection?: 'desc' | 'asc';
  pageNumber?: string;
  pageSize?: string;
  searchLoginTerm?: string;
  searchEmailTerm?: string;
}
