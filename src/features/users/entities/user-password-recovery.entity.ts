import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('users_password_recovery')
export class UserPasswordRecovery {
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
