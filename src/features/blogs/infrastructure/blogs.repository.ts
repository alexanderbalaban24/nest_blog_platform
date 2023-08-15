import { Blog, BlogDocument, BlogModelType } from '../domain/blogs.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { ResultDTO } from '../../../shared/dto';
import { InternalCode } from '../../../shared/enums';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectModel(Blog.name) private BlogModel: BlogModelType,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async createBlog(
    name: string,
    description: string,
    websiteUrl: string,
    userId: string,
  ): Promise<ResultDTO<{ blogId: string }>> {
    const res = await this.dataSource.query(
      `
    WITH "blog_temp" AS (
    INSERT INTO "blogs" AS b
    ("name", "description", "websiteUrl", "ownerId")
    VALUES($1, $2, $3, $4)
    RETURNING "id" AS "blogId" 
    )
    INSERT INTO "blogs_ban" AS bb
    ("blogId")
    VALUES((SELECT bt."blogId" FROM "blog_temp" AS bt))
    RETURNING "blogId"
    `,
      [name, description, websiteUrl, userId],
    );

    return new ResultDTO(InternalCode.Success, res[0]);
  }

  async findById(blogId: string): Promise<ResultDTO<any>> {
    const blogsRaw = await this.dataSource.query(
      `
    SELECT b."id", b."name", b."description", b."websiteUrl", b."isMembership", b."ownerId" as "userId", b."createdAt", u."login" as "userLogin", bb."isBanned"
    FROM "blogs" AS b
    LEFT JOIN "blogs_ban" AS bb
    ON bb."blogId" = b."id"
    LEFT JOIN "users" AS u
    ON u."id" = b."ownerId"
    WHERE b."id" = $1
    `,
      [blogId],
    );
    if (!blogsRaw.length) return new ResultDTO(InternalCode.NotFound);

    return new ResultDTO<BlogDocument>(InternalCode.Success, blogsRaw[0]);
  }

  async updateById(
    blogId: string,
    name: string,
    description: string,
    websiteUrl: string,
  ): Promise<ResultDTO<null>> {
    await this.dataSource.query(
      `
    UPDATE "blogs" AS b
    SET "name" = $1, "description" = $2, "websiteUrl" = $3
    WHERE b."id" = $4
    `,
      [name, description, websiteUrl, blogId],
    );

    return new ResultDTO(InternalCode.Success);
  }

  async deleteById(blogId: string): Promise<ResultDTO<null>> {
    await this.dataSource.query(
      `
    WITH delete_temp AS (
    DELETE FROM "blogs_ban" as bb
    WHERE bb."blogId" = $1
    )
    DELETE FROM "blogs" as b
    WHERE b."id" = $1
    `,
      [blogId],
    );

    return new ResultDTO(InternalCode.Success);
  }

  async banBlog(
    blogId: string,
    isBanned: boolean,
    banDate: Date,
  ): Promise<ResultDTO<null>> {
    await this.dataSource.query(
      `
    UPDATE "blogs_ban" AS bb
    SET "isBanned" = $2, "banDate" = $3
    WHERE bb."blogId" = $1
    `,
      [blogId, isBanned, banDate],
    );

    return new ResultDTO(InternalCode.Success);
  }

  async bindBlog(blogId: string, userId: string): Promise<ResultDTO<null>> {
    await this.dataSource.query(
      `
    UPDATE "blogs" AS b
    SET "ownerId" = $1
    WHERE b."id" = $2
    `,
      [userId, blogId],
    );

    return new ResultDTO(InternalCode.Success);
  }

  async create(
    blogInstance: BlogDocument,
  ): Promise<ResultDTO<{ blogId: string }>> {
    const createdBlogInstance = await blogInstance.save();

    return new ResultDTO(InternalCode.Success, {
      blogId: createdBlogInstance._id.toString(),
    });
  }

  async save(blogInstance: BlogDocument): Promise<ResultDTO<null>> {
    await blogInstance.save();

    return new ResultDTO(InternalCode.Success);
  }
}
