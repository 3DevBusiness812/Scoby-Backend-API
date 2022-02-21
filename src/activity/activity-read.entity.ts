import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ActivityRead {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'id_user' })
  idUser: number;

  @Column({ name: 'id_activity' })
  idActivity: number;
}
