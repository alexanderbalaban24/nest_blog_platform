import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('users_email_confirmation')
export class UserEmailConfirmation {
  @Column({ default: () => 'uuid_generate_v4()' })
  confirmationCode: string;
  @Column()
  expirationDate: Date;
  @Column({ default: false })
  isConfirmed: boolean;
  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;
  @PrimaryColumn()
  userId: number;
}
