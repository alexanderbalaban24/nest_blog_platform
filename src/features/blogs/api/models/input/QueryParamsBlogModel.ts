import { IsOptional } from 'class-validator';

export class QueryParamsBlogModel {
  @IsOptional()
  searchNameTerm: string;
  @IsOptional()
  sortBy: string;
  @IsOptional()
  sortDirection: 'desc' | 'asc';
  @IsOptional()
  pageNumber: string;
  @IsOptional()
  pageSize: string;
}
