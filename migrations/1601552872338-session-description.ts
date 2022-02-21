import { MigrationInterface, QueryRunner } from 'typeorm';

export class sessionDescription1601552872338 implements MigrationInterface {
  name = 'sessionDescription1601552872338';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "session" ADD "description" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "session" DROP COLUMN "description"`);
  }
}
