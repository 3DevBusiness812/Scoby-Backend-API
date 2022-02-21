import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  JoinColumn,
  Index,
  ManyToOne,
} from 'typeorm';
import { Series } from './series.entity';

@Entity()
export class Schedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  day: string;

  @Column('time', { name: 'start_serie' })
  startSerie: Date;

  @Column('time', { name: 'end_serie' })
  endSerie: Date;

  @ManyToOne(() => Series, {
    nullable: false,
    onDelete: 'CASCADE',
    primary: true,
  })
  @Index()
  @JoinColumn({ name: 'id_serie' })
  serie: Series;
}
