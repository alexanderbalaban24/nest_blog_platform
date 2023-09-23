import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Post } from '../../posts/entities/post.entity';
import { User } from '../../users/entities/user.entity';
import { CommentLike } from './comment-like.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => Post, (p) => p.comments)
  post: Post;
  @Column()
  postId: number;
  @Column()
  content: string;
  @ManyToOne(() => User, (u) => u.comments)
  user: User;
  @Column()
  userId: number;
  @Column({ default: () => 'now()', type: 'timestamp' })
  createdAt: Date;
  @OneToMany(() => CommentLike, (cl) => cl.comment)
  likes: CommentLike[];
}
