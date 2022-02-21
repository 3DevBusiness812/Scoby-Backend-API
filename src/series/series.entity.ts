import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Topic } from '../topics/topic.entity';
import { Session } from '../sessions/session.entity';
import { Schedule } from './series-schedule.entity';

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
export class Series {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: true })
  calendarName?: string | null;

  @Column({ type: 'varchar', nullable: true })
  className?: string | null;

  @Column()
  seriesName: string;

  @Column()
  description: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'owner_user_id' })
  ownerUser: User;

  @ManyToMany(() => Topic, { nullable: false, eager: true, cascade: true })
  @JoinTable({
    name: 'series_topics',
    joinColumn: { name: 'series_id' },
    inverseJoinColumn: { name: 'topic_id' },
  })
  topics: Topic[];

  @ManyToMany(() => User, { nullable: true, cascade: true })
  @JoinTable({
    name: 'series_subscribed_users',
    joinColumn: { name: 'session_id' },
    inverseJoinColumn: { name: 'user_id' },
  })
  suscribeUsers: User[];

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

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'finished_at' })
  finishedAt?: Date | null;

  @OneToOne(() => Session, { nullable: true, cascade: true })
  @JoinColumn()
  session?: Session | null;

  @OneToMany(() => Schedule, (ufu) => ufu.serie)
  schedule: Schedule[];
}
