import {
  Column,
  Entity,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Comment } from './comment.entity';
import { LikeStatusEnum } from '../../../shared/enums';
import { User } from '../../users/entities/user.entity';

@Entity('comment_likes')
export class CommentLike {
  @PrimaryGeneratedColumn('uuid')
  id: number;
  @ManyToOne(() => Comment, (c) => c.likes)
  comment: Comment;
  @Column()
  commentId: number;
  @ManyToOne(() => User, (u) => u.commentLikes)
  user: User;
  @Column()
  userId: number;
  @Column({ enum: LikeStatusEnum })
  status: LikeStatusEnum;
  @Column({ default: () => 'now()', type: 'timestamp' })
  createdAt: Date;
}
