import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModelType } from './features/blogs/domain/blogs.entity';
import { Post, PostModelType } from './features/posts/domain/posts.entity';
import { User, UserModelType } from './features/users/domain/users.entity';

@Injectable()
export class AppService {
  constructor(
    @InjectModel(Blog.name) private BlogModel: BlogModelType,
    @InjectModel(Post.name) private PostModel: PostModelType,
    @InjectModel(User.name) private UserModel: UserModelType,
  ) {}

  async deleteAllData(): Promise<boolean> {
    try {
      const deletedResult = await Promise.all([
        this.BlogModel.deleteMany({}),
        this.PostModel.deleteMany({}),
        this.UserModel.deleteMany({}),
      ]);

      return deletedResult.every((item) => item.deletedCount === 1);
    } catch (e) {
      return false;
    }
  }
}
