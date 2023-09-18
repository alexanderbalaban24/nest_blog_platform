import { Injectable } from '@nestjs/common';
import { ResultDTO } from '../../../shared/dto';
import { InternalCode } from '../../../shared/enums';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Blog } from '../entities/blog.entity';

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(Blog) private blogsRepo: Repository<Blog>,
  ) {}

  async create(blog: Blog): Promise<ResultDTO<{ blogId: number }>> {
    const res = await this.blogsRepo.save(blog);

    return new ResultDTO(InternalCode.Success, { blogId: res.id });
  }

  async save(blog: Blog): Promise<ResultDTO<null>> {
    const res = await this.blogsRepo.save(blog);

    return new ResultDTO(InternalCode.Success);
  }

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

  async findById(blogId: number): Promise<ResultDTO<Blog>> {
    const blog = await this.blogsRepo.findOneBy({ id: blogId });
    if (!blog) return new ResultDTO(InternalCode.NotFound);

    return new ResultDTO(InternalCode.Success, blog);
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
    const res = await this.blogsRepo.delete(blogId);

    if (res.affected !== 1) return new ResultDTO(InternalCode.NotFound);

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
}
