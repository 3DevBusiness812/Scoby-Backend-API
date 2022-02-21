import {MigrationInterface, QueryRunner} from "typeorm";

export class sessionViewers1602154053829 implements MigrationInterface {
    name = 'sessionViewers1602154053829'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "sessions_viewer_users" ("session_id" integer NOT NULL, "user_id" integer NOT NULL, CONSTRAINT "PK_0d143051ea9d1cfb4b4d2163c07" PRIMARY KEY ("session_id", "user_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_d54b5cab8b62ece2d844167cd8" ON "sessions_viewer_users" ("session_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_6132dbf266ccd1cfd48300e266" ON "sessions_viewer_users" ("user_id") `);
        await queryRunner.query(`ALTER TABLE "sessions_viewer_users" ADD CONSTRAINT "FK_d54b5cab8b62ece2d844167cd8b" FOREIGN KEY ("session_id") REFERENCES "session"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sessions_viewer_users" ADD CONSTRAINT "FK_6132dbf266ccd1cfd48300e2669" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sessions_viewer_users" DROP CONSTRAINT "FK_6132dbf266ccd1cfd48300e2669"`);
        await queryRunner.query(`ALTER TABLE "sessions_viewer_users" DROP CONSTRAINT "FK_d54b5cab8b62ece2d844167cd8b"`);
        await queryRunner.query(`DROP INDEX "IDX_6132dbf266ccd1cfd48300e266"`);
        await queryRunner.query(`DROP INDEX "IDX_d54b5cab8b62ece2d844167cd8"`);
        await queryRunner.query(`DROP TABLE "sessions_viewer_users"`);
    }

}
