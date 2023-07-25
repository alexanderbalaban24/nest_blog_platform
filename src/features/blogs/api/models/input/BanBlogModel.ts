import { IsBoolean } from 'class-validator';

export class BanBlogModel {
  @IsBoolean()
  isBanned: boolean;
}
