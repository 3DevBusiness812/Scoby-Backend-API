import { MigrationInterface, QueryRunner } from 'typeorm';

export class sessionRemoveName1603197041907 implements MigrationInterface {
  name = 'sessionRemoveName1603197041907';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "session" DROP COLUMN "name"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "session" ADD "name" character varying`,
    );
    await queryRunner.query(`UPDATE "session" SET "name" = ''`);
    await queryRunner.query(
      `ALTER TABLE "session" ALTER COLUMN "name" SET NOT NULL`,
    );
  }
}
