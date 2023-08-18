import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument, PostModelType } from '../domain/posts.entity';
import { ResultDTO } from '../../../shared/dto';
import { InternalCode, LikeStatusEnum } from '../../../shared/enums';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export class PostsRepository {
  constructor(
    @InjectModel(Post.name) private PostModel: PostModelType,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

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

  async findById(postId: string): Promise<ResultDTO<any>> {
    const postsRaw = await this.dataSource.query(
      `
    SELECT p."id", p."ownerId" AS "userId", p."title", p."shortDescription", p."content", p."blogId", p."createdAt"
    FROM "posts" AS p
    WHERE p."id" = $1
    `,
      [postId],
    );
    if (!postsRaw.length) return new ResultDTO(InternalCode.NotFound);

    return new ResultDTO(InternalCode.Success, postsRaw[0]);
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

  async deleteById(postId: string): Promise<ResultDTO<null>> {
    await this.dataSource.query(
      `
    DELETE FROM "posts" AS p
    WHERE p."id" = $1
    `,
      [postId],
    );

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

  async findByBlogId(blogId: string): Promise<ResultDTO<PostDocument[]>> {
    const postInstances = await this.PostModel.find({ blogId });
    if (!postInstances) return new ResultDTO(InternalCode.NotFound);

    return new ResultDTO(InternalCode.Success, postInstances);
  }

  async findByUserId(userId: string): Promise<ResultDTO<PostDocument[]>> {
    const postInstances = await this.PostModel.find({ ownerId: userId });

    return new ResultDTO(InternalCode.Success, postInstances);
  }

  async findByUserLike(userId: string): Promise<ResultDTO<PostDocument[]>> {
    const postInstances = await this.PostModel.find({
      'usersLikes.userId': userId,
    });

    return new ResultDTO(InternalCode.Success, postInstances);
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
