import {
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './user.entity';

@Entity('users_follow_users')
export class UsersFollowUsers {
  @ManyToOne(() => User, {
    nullable: false,
    onDelete: 'CASCADE',
    primary: true,
  })
  @Index()
  @JoinColumn({ name: 'source_user_id' })
  sourceUser: User;

  @ManyToOne(() => User, {
    nullable: false,
    onDelete: 'CASCADE',
    primary: true,
  })
  @Index()
  @JoinColumn({ name: 'target_user_id' })
  targetUser: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
