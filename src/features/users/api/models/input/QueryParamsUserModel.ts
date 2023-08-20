import { BanStatus } from '../../../../../shared/enums';
import { IsOptional } from 'class-validator';

export class QueryParamsUserModel {
  @IsOptional()
  banStatus: BanStatus;
  @IsOptional()
  sortBy: string;
  @IsOptional()
  sortDirection: 'desc' | 'asc';
  @IsOptional()
  pageNumber: string;
  @IsOptional()
  pageSize: string;
  @IsOptional()
  searchLoginTerm: string;
  @IsOptional()
  searchEmailTerm: string;
}
