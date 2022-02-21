import { MigrationInterface, QueryRunner } from 'typeorm';

export class usersInappropriateUsers1605264136188
  implements MigrationInterface {
  name = 'usersInappropriateUsers1605264136188';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "users_inappropriate_users" ("source_user_id" integer NOT NULL, "target_user_id" integer NOT NULL, CONSTRAINT "PK_7401829b59dd211ccb1cbf6ab23" PRIMARY KEY ("source_user_id", "target_user_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_be933adfeae269bfb07da236f0" ON "users_inappropriate_users" ("source_user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3bbd0c20076737c7d050aafaea" ON "users_inappropriate_users" ("target_user_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "users_inappropriate_users" ADD CONSTRAINT "FK_be933adfeae269bfb07da236f07" FOREIGN KEY ("source_user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_inappropriate_users" ADD CONSTRAINT "FK_3bbd0c20076737c7d050aafaea9" FOREIGN KEY ("target_user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users_inappropriate_users" DROP CONSTRAINT "FK_3bbd0c20076737c7d050aafaea9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_inappropriate_users" DROP CONSTRAINT "FK_be933adfeae269bfb07da236f07"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_3bbd0c20076737c7d050aafaea"`);
    await queryRunner.query(`DROP INDEX "IDX_be933adfeae269bfb07da236f0"`);
    await queryRunner.query(`DROP TABLE "users_inappropriate_users"`);
  }
}
