import { IsOptional } from 'class-validator';

export class QueryParamsCommentModel {
  @IsOptional()
  pageNumber: string;
  @IsOptional()
  pageSize: string;
  @IsOptional()
  sortBy: string;
  @IsOptional()
  sortDirection: 'asc' | 'desc';
}
