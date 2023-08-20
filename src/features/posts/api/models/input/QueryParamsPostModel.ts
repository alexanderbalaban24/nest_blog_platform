import { IsOptional } from 'class-validator';

export class QueryParamsPostModel {
  @IsOptional()
  sortBy: string;
  @IsOptional()
  sortDirection: 'desc' | 'asc';
  @IsOptional()
  pageNumber: string;
  @IsOptional()
  pageSize: string;
}
