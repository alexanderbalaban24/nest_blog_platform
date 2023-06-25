import { IsExistPost } from '../../../../infrastructure/decorators/validators/existPost.validator';

export class UriParamsCommentModel {
  @IsExistPost()
  postId: string;
}
