import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class AppService {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async deleteAllData(): Promise<boolean> {
    try {
      await this.dataSource.query(`DELETE FROM "users_ban"`);
      await this.dataSource.query(`DELETE FROM "users_email_confirmation"`);
      await this.dataSource.query(`DELETE FROM "users_password_recovery"`);
      await this.dataSource.query(`DELETE FROM "users_devices"`);
      await this.dataSource.query(`DELETE FROM "blogs_ban"`);
      await this.dataSource.query(`DELETE FROM "users_ban_for_blog"`);
      await this.dataSource.query(`DELETE FROM "posts_comments_likes"`);
      await this.dataSource.query(`DELETE FROM "posts_comments"`);
      await this.dataSource.query(`DELETE FROM "posts_likes"`);
      await this.dataSource.query(`DELETE FROM "posts"`);
      await this.dataSource.query(`DELETE FROM "blogs"`);
      await this.dataSource.query(`DELETE FROM "users"`);

      return true;
    } catch (e) {
      return false;
    }
  }
}
