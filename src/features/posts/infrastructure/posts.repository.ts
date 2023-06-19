import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument, PostModelType } from '../domain/posts.entity';
import { Types } from 'mongoose';

export class PostsRepository {
  constructor(@InjectModel(Post.name) private PostModel: PostModelType) {}

  async findById(postId: Types.ObjectId): Promise<PostDocument> {
    return this.PostModel.findById(postId);
  }

  async save(postInstance: PostDocument): Promise<boolean> {
    await postInstance.save();
    return true;
  }

  async create(post: PostDocument): Promise<Types.ObjectId> {
    const createdPostInstance = await post.save();

    return createdPostInstance._id;
  }
}
