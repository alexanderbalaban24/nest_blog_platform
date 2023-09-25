import { Injectable } from '@nestjs/common';
import { ResultDTO } from '../../../../shared/dto';
import { InternalCode } from '../../../../shared/enums';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CommentLike } from '../../entities/comment-like.entity';

@Injectable()
export class CommentsLikeRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(CommentLike) private commentRepo: Repository<CommentLike>,
  ) {}

  async save(comment: CommentLike): Promise<ResultDTO<null>> {
    await this.commentRepo.save(comment);

    return new ResultDTO(InternalCode.Success);
  }

  async findLike(
    commentId: number,
    userId: number,
  ): Promise<ResultDTO<CommentLike>> {
    const like = await this.commentRepo.findOne({
      where: { commentId, userId },
    });

    return new ResultDTO(InternalCode.Success, like);
  }
}
