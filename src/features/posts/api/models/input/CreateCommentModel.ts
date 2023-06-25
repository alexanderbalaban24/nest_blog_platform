import { IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCommentModel {
  @IsString()
  @Transform(({ value }) => value.trim())
  @Length(20, 300)
  content: string;
}
