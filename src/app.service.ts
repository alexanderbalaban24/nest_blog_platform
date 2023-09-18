import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class AppService {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async deleteAllData(): Promise<boolean> {
    try {
      await this.dataSource.query(
        `TRUNCATE TABLE "users_ban" RESTART IDENTITY CASCADE`,
      );
      await this.dataSource.query(
        `TRUNCATE TABLE "users_email_confirmation" RESTART IDENTITY CASCADE`,
      );
      await this.dataSource.query(
        `TRUNCATE TABLE "users_password_recovery" RESTART IDENTITY CASCADE`,
      );
      await this.dataSource.query(
        `TRUNCATE TABLE "users_devices" RESTART IDENTITY CASCADE`,
      );
      await this.dataSource.query(
        `TRUNCATE TABLE "blogs_ban" RESTART IDENTITY CASCADE`,
      );
      /*await this.dataSource.query(
        `TRUNCATE TABLE "users_ban_for_blog" RESTART IDENTITY CASCADE`,
      );*/
      /*await this.dataSource.query(
        `TRUNCATE TABLE "posts_comments_likes" RESTART IDENTITY CASCADE`,
      );*/
      /*await this.dataSource.query(
        `TRUNCATE TABLE "posts_comments" RESTART IDENTITY CASCADE`,
      );*/
      /* await this.dataSource.query(
        `TRUNCATE TABLE "posts_likes" RESTART IDENTITY CASCADE`,
      );*/
      await this.dataSource.query(
        `TRUNCATE TABLE "posts" RESTART IDENTITY CASCADE`,
      );
      await this.dataSource.query(
        `TRUNCATE TABLE "blogs" RESTART IDENTITY CASCADE`,
      );
      await this.dataSource.query(
        `TRUNCATE TABLE "users" RESTART IDENTITY CASCADE`,
      );

      return true;
    } catch (e) {
      return false;
    }
  }
}
