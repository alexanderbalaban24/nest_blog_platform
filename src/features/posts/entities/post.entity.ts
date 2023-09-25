import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Blog } from '../../blogs/entities/blog.entity';
import { Comment } from '../../comments/entities/comment.entity';
import { PostLike } from './post-like.entity';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  title: string;
  @Column()
  shortDescription: string;
  @Column()
  content: string;
  @Column({ default: () => 'now()', type: 'timestamp' })
  createdAt: Date;
  @ManyToOne(() => Blog, (b) => b.posts, { onDelete: 'CASCADE' })
  blog: Blog;
  @Column()
  blogId: number;
  @OneToMany(() => Comment, (c) => c.post, { onDelete: 'CASCADE' })
  comments: Comment[];
  @OneToMany(() => PostLike, (pl) => pl.postId)
  likes: PostLike[];
}
