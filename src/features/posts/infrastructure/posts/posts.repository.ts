import { ResultDTO } from '../../../../shared/dto';
import { InternalCode, LikeStatusEnum } from '../../../../shared/enums';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Post } from '../../entities/post.entity';

export class PostsRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(Post) private postsRepo: Repository<Post>,
  ) {}

  async create(post: Post): Promise<ResultDTO<{ postId: number }>> {
    const res = await this.postsRepo.save(post);

    return new ResultDTO(InternalCode.Success, { postId: res.id });
  }

  async save(post: Post): Promise<ResultDTO<null>> {
    await this.postsRepo.save(post);

    return new ResultDTO(InternalCode.Success);
  }

  async findById(postId: number): Promise<ResultDTO<Post>> {
    const post = await this.postsRepo.findOneBy({ id: postId });
    if (!post) return new ResultDTO(InternalCode.NotFound);

    return new ResultDTO(InternalCode.Success, post);
  }

  async createPost(
    ownerId: string,
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
  ): Promise<ResultDTO<{ postId: string }>> {
    const res = await this.dataSource.query(
      `
    INSERT INTO "posts" AS p
    ("ownerId", "title", "shortDescription", "content", "blogId")
    VALUES($1, $2, $3, $4, $5)
    RETURNING p."id" as "postId"
    `,
      [ownerId, title, shortDescription, content, blogId],
    );

    return new ResultDTO(InternalCode.Success, res[0]);
  }

  async updateById(
    title: string,
    shortDescription: string,
    content: string,
    postId: string,
  ): Promise<ResultDTO<null>> {
    await this.dataSource.query(
      `
    UPDATE "posts" as p
    SET "title" = $1, "shortDescription" = $2, "content" = $3 
    WHERE p."id" = $4
    `,
      [title, shortDescription, content, postId],
    );

    return new ResultDTO(InternalCode.Success);
  }

  async deleteById(postId: number): Promise<ResultDTO<null>> {
    const res = await this.postsRepo.delete(postId);

    if (res.affected !== 1) return new ResultDTO(InternalCode.NotFound);

    return new ResultDTO(InternalCode.Success);
  }

  async likeById(
    postId: string,
    userId: string,
    likeStatus: LikeStatusEnum,
    addedAt: Date,
  ): Promise<ResultDTO<null>> {
    await this.dataSource.query(
      `
    WITH "temp_data" AS (
    SELECT pl."id" AS "postId"
    FROM "posts_likes" AS pl
    WHERE pl."postId" = $1 AND
    pl."userId" = $2
    )
    INSERT INTO "posts_likes" AS pl
    ("postId", "userId", "addedAt", "status", "id")
    VALUES($1, $2, $4, (SELECT lse."id" FROM "like_status_enum" AS lse WHERE lse."status" = $3), COALESCE((SELECT td."postId" FROM "temp_data" AS td), uuid_generate_v1()))
    ON CONFLICT ("id") DO UPDATE
    SET "status" = (SELECT lse."id" FROM "like_status_enum" AS lse WHERE lse."status" = $3)
    `,
      [postId, userId, likeStatus, addedAt],
    );

    return new ResultDTO(InternalCode.Success);
  }
}
