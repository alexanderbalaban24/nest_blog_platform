import { InjectModel } from '@nestjs/mongoose';
import {
  Comment,
  CommentDocument,
  CommentModelType,
} from '../domain/comments.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
  ) {}

  async findById(commentId: string): Promise<CommentDocument> {
    return this.CommentModel.findById(commentId);
  }

  async create(commentInstance: CommentDocument): Promise<string> {
    const newComment = await commentInstance.save();

    return newComment._id.toString();
  }

  async save(commentInstance: CommentDocument): Promise<boolean> {
    await commentInstance.save();

    return true;
  }
}
