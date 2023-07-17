import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { IsExistBlog } from '../../../../infrastructure/decorators/validators/existBlog.validator';
import { Optional } from '@nestjs/common';

export class CreatePostModel {
  @IsString()
  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  @MaxLength(30)
  title: string;
  @IsString()
  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  @MaxLength(100)
  shortDescription: string;
  @IsString()
  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  @MaxLength(1000)
  content: string;
  //TODO порешать, походу уже не нужно
  /*@Optional()
  @IsString()
  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  @MaxLength(100000)
  @IsExistBlog()
  blogId?: string;*/
}
