import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Comment } from './comment.entity';
import { LikeStatusEnum } from '../../../shared/enums';
import { User } from '../../users/entities/user.entity';

@Entity('comment_likes')
export class CommentLike {
  @ManyToOne(() => Comment, (c) => c.likes)
  comment: Comment;
  @Column()
  commentId: number;
  @ManyToOne(() => User, (u) => u.commentLikes)
  user: User;
  @PrimaryColumn()
  userId: number;
  @Column({ enum: LikeStatusEnum })
  status: LikeStatusEnum;
  @Column({ default: () => 'now()', type: 'timestamp' })
  createdAt: Date;
}
