import { IsBoolean, IsString, MinLength } from 'class-validator';
import { IsExistBlog } from '../../../../infrastructure/decorators/validators/existBlog.validator';

export class UserBanForSpecificBlogModel {
  @IsBoolean()
  isBanned: boolean;
  @IsString()
  @MinLength(20)
  banReason: string;
  @IsExistBlog()
  blogId: string;
}
