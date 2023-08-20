import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

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
}
