import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Post } from './post.entity';
import { User } from '../../users/entities/user.entity';
import { LikeStatusEnum } from '../../../shared/enums';

@Entity('post_likes')
export class PostLike {
  @ManyToOne(() => Post, (p) => p.likes)
  post: Post;
  @Column()
  postId: number;
  @ManyToOne(() => User, (u) => u.postLikes)
  user: User;
  @PrimaryColumn()
  userId: number;
  @Column({ enum: LikeStatusEnum })
  status: LikeStatusEnum;
  @Column({ default: () => 'now()', type: 'timestamp' })
  createdAt: Date;
}
