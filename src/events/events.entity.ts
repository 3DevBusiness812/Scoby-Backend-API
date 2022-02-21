import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { Topic } from '../topics/topic.entity';
import { User } from '../users/user.entity';
import { Session } from '../sessions/session.entity';

function ImageLinkTransformerFrom(value: string | null): string | null {
  if (value == null) return value;
  const bucketName = process.env.AWS_S3_USER_PROFILE_ASSETS_BUCKET;
  const baseUrl = process.env.AWS_S3_BASE_URL;
  return `https://${bucketName}.${baseUrl}/${value}`;
}

function ImageLinkTransformerTo(value: string | null): string | null {
  if (value == null) return value;

  try {
    const url = new URL(value);
    const pathSplitted = url.pathname.split('/');
    return pathSplitted[pathSplitted.length - 1];
  } catch (e) {
    return value;
  }
}
@Entity()
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({ name: 'day_event', type: 'date'})
  day: Date;

  @Column('time', { name: 'start_event' })
  start: Date;

  @Column('time', { name: 'end_event' })
  end: Date;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'owner_user_id' })
  ownerUser: User;

  @Column({
    type: 'varchar',
    nullable: true,
    name: 'background_image',
    transformer: {
      from: ImageLinkTransformerFrom,
      to: ImageLinkTransformerTo,
    },
  })
  backgroundImage?: string | null;

  @Column({
    type: 'varchar',
    nullable: true,
    transformer: {
      from: ImageLinkTransformerFrom,
      to: ImageLinkTransformerTo,
    },
  })
  avatar?: string | null;

  @ManyToMany(() => Topic, { nullable: false, eager: true, cascade: true })
  @JoinTable({
    name: 'events_topics',
    joinColumn: { name: 'event_id' },
    inverseJoinColumn: { name: 'topic_id' },
  })
  topics: Topic[];

  @ManyToMany(() => User, { nullable: true, cascade: true })
  @JoinTable({
    name: 'events_subscribed_users',
    joinColumn: { name: 'event_id' },
    inverseJoinColumn: { name: 'user_id' },
  })
  suscribeUsers: User[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'finished_at' })
  finishedAt?: Date | null;

  @OneToOne(() => Session, { nullable: true, cascade: true })
  @JoinColumn()
  session?: Session | null;
}
