import { InjectModel } from '@nestjs/mongoose';
import {
  Comment,
  CommentDocument,
  CommentModelType,
} from '../domain/comments.entity';
import { Injectable } from '@nestjs/common';
import { ResultDTO } from '../../../shared/dto';
import { InternalCode } from '../../../shared/enums';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
  ) {}

  async findById(commentId: string): Promise<ResultDTO<CommentDocument>> {
    const commentInstance = await this.CommentModel.findById(commentId);

    return new ResultDTO(InternalCode.Success, commentInstance);
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
