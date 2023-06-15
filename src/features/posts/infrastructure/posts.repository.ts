import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument, PostModelType } from '../domain/posts.entity';
import { NotFoundException } from '@nestjs/common';

export class PostsRepository {
  constructor(@InjectModel(Post.name) private PostModel: PostModelType) {}

  async findById(postId: string): Promise<PostDocument> {
    const postInstance = this.PostModel.findById(postId);
    if (!postInstance) throw new NotFoundException();

    return postInstance;
  }

  async save(postInstance: PostDocument): Promise<boolean> {
    await postInstance.save();
    return true;
  }

  async create(post: PostDocument): Promise<string> {
    const createdPostInstance = await post.save();

    return createdPostInstance._id.toString();
  }
}
