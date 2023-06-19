export class QueryParamsBlogModel {
  searchNameTerm?: string;
  sortBy?: string;
  sortDirection?: 'desc' | 'asc';
  pageNumber?: string;
  pageSize?: string;
}
