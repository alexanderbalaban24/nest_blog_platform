import { InjectModel } from '@nestjs/mongoose';
import {
  Comment,
  CommentDocument,
  CommentModelType,
} from '../domain/comments.entity';
import { Injectable } from '@nestjs/common';
import { ResultDTO } from '../../../shared/dto';
import { InternalCode, LikeStatusEnum } from '../../../shared/enums';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async findById(commentId: string): Promise<ResultDTO<any>> {
    const commentRaw = await this.dataSource.query(
      `
     SELECT pc."id", pc."content", u."id" AS "userId", u."login" AS "userLogin", pc."createdAt"
    FROM "posts_comments" AS pc
    LEFT JOIN "users" AS u
    ON u."id" = pc."commentatorId"
    LEFT JOIN "posts" AS p
    ON p."id" = pc."postId"
    LEFT JOIN "blogs_ban" AS bb
    ON bb."blogId" = p."blogId"
    LEFT JOIN "posts_comments_likes" AS pcl
    ON pcl."commentId" = $1
    WHERE pc."id" = $1 AND
    bb."isBanned" != true
    `,
      [commentId],
    );
    if (!commentRaw.length) return new ResultDTO(InternalCode.NotFound);

    return new ResultDTO(InternalCode.Success, commentRaw[0]);
  }

  async deleteById(commentId: string): Promise<ResultDTO<null>> {
    await this.dataSource.query(
      `
    DELETE FROM "posts_comments" AS pc
    WHERE pc."id" = $1
    `,
      [commentId],
    );

    return new ResultDTO(InternalCode.Success);
  }

  async updateById(
    commentId: string,
    content: string,
  ): Promise<ResultDTO<null>> {
    await this.dataSource.query(
      `
    UPDATE "posts_comments" AS pc
    SET "content" = $1
    WHERE pc."id" = $2
    `,
      [content, commentId],
    );

    return new ResultDTO(InternalCode.Success);
  }

  async likeById(
    commentId: string,
    userId: string,
    likeStatus: LikeStatusEnum,
  ): Promise<ResultDTO<null>> {
    await this.dataSource.query(
      `
    WITH "temp_data" AS (
    SELECT pcl."id" AS "commentId"
   FROM "posts_comments_likes" AS pcl
   WHERE pcl."commentId" = $1 AND
   pcl."userId" = $2
    )
    INSERT INTO "posts_comments_likes" AS pcl
    ("commentId", "userId", "status", "id")
    VALUES($1, $2, (SELECT lse."id" FROM "like_status_enum" AS lse WHERE lse."status" = $3), COALESCE((SELECT td."commentId" FROM "temp_data" AS td), uuid_generate_v1()))
    ON CONFLICT ("id") DO UPDATE
    SET "status" = (SELECT lse."id" FROM "like_status_enum" AS lse WHERE lse."status" = $3)
    `,
      [commentId, userId, likeStatus],
    );

    return new ResultDTO(InternalCode.Success);
  }

  async findByUserId(userId: string): Promise<ResultDTO<CommentDocument[]>> {
    const commentInstances = await this.CommentModel.find({
      'commentatorInfo.userId': userId,
    });

    return new ResultDTO(InternalCode.Success, commentInstances);
  }

  async findByUserLike(userId: string): Promise<ResultDTO<CommentDocument[]>> {
    const commentInstances = await this.CommentModel.find({
      'usersLikes.userId': userId,
    });

    return new ResultDTO(InternalCode.Success, commentInstances);
  }

  async createComment(
    postId: string,
    content: string,
    userId: string,
  ): Promise<ResultDTO<null>> {
    const res = await this.dataSource.query(
      `
    INSERT INTO "posts_comments"
    ("postId", "content", "commentatorId")
    VALUES($1, $2, $3)
    RETURNING "id" AS "commentId"
    `,
      [postId, content, userId],
    );

    return new ResultDTO(InternalCode.Success, res[0]);
  }

  async create(
    commentInstance: CommentDocument,
  ): Promise<ResultDTO<{ commentId: string }>> {
    const createdCommentInstance = await commentInstance.save();

    return new ResultDTO(InternalCode.Success, {
      commentId: createdCommentInstance._id.toString(),
    });
  }

  async save(commentInstance: CommentDocument): Promise<ResultDTO<null>> {
    await commentInstance.save();

    return new ResultDTO(InternalCode.Success);
  }
}
