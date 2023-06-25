import { IsString, Length } from 'class-validator';

export class CreateCommentModel {
  @IsString()
  @Length(20, 300)
  content: string;
}
