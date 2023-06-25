import { IsString, Length } from 'class-validator';

export class UpdateCommentModel {
  @IsString()
  @Length(20, 300)
  content: string;
}
