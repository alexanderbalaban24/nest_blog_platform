// TODO добавить декоратор IsOptional
export class QueryParamsPostModel {
  sortBy?: string;
  sortDirection?: "desc" | "asc";
  pageNumber?: string;
  pageSize?: string;
}
