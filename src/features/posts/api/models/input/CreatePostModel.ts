import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { Types } from 'mongoose';

export class CreatePostModel {
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  title: string;
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  shortDescription: string;
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  content: string;
  @IsString()
  @IsNotEmpty()
  @MaxLength(100000)
  blogId?: string;
}
