import { Injectable } from '@nestjs/common';
import { ResultDTO } from '../../../../shared/dto';
import { InternalCode, LikeStatusEnum } from '../../../../shared/enums';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Comment } from '../../entities/comment.entity';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(Comment) private commentRepo: Repository<Comment>,
  ) {}

  async create(comment: Comment): Promise<ResultDTO<{ commentId: number }>> {
    const res = await this.commentRepo.save(comment);

    return new ResultDTO(InternalCode.Success, { commentId: res.id });
  }

  async save(comment: Comment): Promise<ResultDTO<null>> {
    await this.commentRepo.save(comment);

    return new ResultDTO(InternalCode.Success);
  }

  async findById(commentId: number): Promise<ResultDTO<Comment>> {
    const comment = await this.commentRepo.findOneBy({ id: commentId });
    if (!comment) return new ResultDTO(InternalCode.NotFound);

    return new ResultDTO(InternalCode.Success, comment);
  }

  async deleteById(commentId: string): Promise<ResultDTO<null>> {
    await this.commentRepo.delete(commentId);

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
}
