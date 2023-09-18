import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { Blog } from './blog.entity';

@Entity('blogs_ban')
export class BlogBan {
  @Column({ default: false })
  isBanned: boolean;
  @Column({ default: () => 'now()', type: 'timestamp' })
  bandDate: Date;
  @OneToOne(() => Blog, (b) => b.ban, { onDelete: 'CASCADE' })
  @JoinColumn()
  blog: Blog;
  @PrimaryColumn()
  blogId: number;
}
