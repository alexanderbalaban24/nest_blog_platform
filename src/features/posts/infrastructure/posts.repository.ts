import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument, PostModelType } from '../domain/posts.entity';
import { ResultDTO } from '../../../shared/dto';
import { InternalCode } from '../../../shared/enums';

export class PostsRepository {
  constructor(@InjectModel(Post.name) private PostModel: PostModelType) {}

  async findById(postId: string): Promise<ResultDTO<PostDocument>> {
    const postInstance = await this.PostModel.findById(postId);
    if (!postInstance) return new ResultDTO(InternalCode.NotFound);

    return new ResultDTO(InternalCode.Success, postInstance);
  }

  async save(postInstance: PostDocument): Promise<ResultDTO<null>> {
    await postInstance.save();

    return new ResultDTO(InternalCode.Success);
  }

  async create(post: PostDocument): Promise<ResultDTO<{ postId: string }>> {
    const createdPostInstance = await post.save();

    return new ResultDTO(InternalCode.Success, {
      postId: createdPostInstance._id.toString(),
    });
  }
}
