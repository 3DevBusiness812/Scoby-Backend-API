import { Column, Entity, PrimaryColumn } from 'typeorm';

export enum RegistrationStatusEnum {
  CREATED = 1,
  VERIFIED = 2,
  COMPLETED = 3,
}

@Entity()
export class RegistrationStatus {
  @PrimaryColumn()
  id: number;

  @Column()
  name: string;
}
