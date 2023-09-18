import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Blog } from '../../blogs/entities/blog.entity';

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
  @ManyToOne(() => Blog, (b) => b.posts)
  blog: Blog;
  @Column()
  blogId: number;
}
