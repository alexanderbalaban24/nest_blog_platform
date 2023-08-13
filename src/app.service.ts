import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModelType } from './features/blogs/domain/blogs.entity';
import { Post, PostModelType } from './features/posts/domain/posts.entity';
import { User, UserModelType } from './features/users/domain/users.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class AppService {
  constructor(
    @InjectModel(Blog.name) private BlogModel: BlogModelType,
    @InjectModel(Post.name) private PostModel: PostModelType,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async deleteAllData(): Promise<boolean> {
    try {
      const deletedResult = await Promise.all([
        this.BlogModel.deleteMany({}),
        this.PostModel.deleteMany({}),
      ]);

      await this.dataSource.query(`DELETE FROM "users_ban"`);
      await this.dataSource.query(`DELETE FROM "users_email_confirmation"`);
      await this.dataSource.query(`DELETE FROM "users_password_recovery"`);
      await this.dataSource.query(`DELETE FROM "users_devices"`);
      await this.dataSource.query(`DELETE FROM "users"`);

      return deletedResult.every((item) => item.deletedCount === 1);
    } catch (e) {
      return false;
    }
  }
}
