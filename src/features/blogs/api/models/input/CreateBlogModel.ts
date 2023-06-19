import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

export class CreateBlogModel {
  @IsString()
  @IsNotEmpty()
  @MaxLength(15)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  description: string;

  @IsString()
  @MaxLength(100)
  @IsNotEmpty()
  @Matches(
    '^https:\\/\\/([a-zA-Z0-9_-]+\\.)+[a-zA-Z0-9_-]+(\\/[a-zA-Z0-9_-]+)*\\/?$',
  )
  websiteUrl: string;
}
