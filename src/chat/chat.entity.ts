import { User } from '../users/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class ChatRoom {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToMany(() => User, { nullable: false, cascade: true })
  @JoinTable({
    name: 'chat_room_participants',
    joinColumn: { name: 'chat_room_id' },
    inverseJoinColumn: { name: 'users_id' },
  })
  participantUsers: User[];

  @OneToMany(() => ChatMessage, (message) => message.room, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  messages: ChatMessage[];
}

@Entity()
export class ChatMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  text: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @ManyToOne(() => ChatRoom, { nullable: false, onDelete: 'CASCADE', })
  @JoinColumn({ name: 'room_id' })
  room: ChatRoom;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ default: false })
  isRead: boolean;
}
