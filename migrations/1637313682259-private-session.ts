import {MigrationInterface, QueryRunner} from "typeorm";

export class privateSession1637313682259 implements MigrationInterface {
    name = 'privateSession1637313682259'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "invited_users" ("session_id" integer NOT NULL, "user_id" integer NOT NULL, CONSTRAINT "PK_89dc953c737dcaac3d2266de114" PRIMARY KEY ("session_id", "user_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_4a4de9a5594235fb215ebf18bd" ON "invited_users" ("session_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_f3095c2076a1d79e4cbe889e66" ON "invited_users" ("user_id") `);
        await queryRunner.query(`ALTER TABLE "session" ADD "isPrivate" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "invited_users" ADD CONSTRAINT "FK_4a4de9a5594235fb215ebf18bde" FOREIGN KEY ("session_id") REFERENCES "session"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invited_users" ADD CONSTRAINT "FK_f3095c2076a1d79e4cbe889e665" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invited_users" DROP CONSTRAINT "FK_f3095c2076a1d79e4cbe889e665"`);
        await queryRunner.query(`ALTER TABLE "invited_users" DROP CONSTRAINT "FK_4a4de9a5594235fb215ebf18bde"`);
        await queryRunner.query(`ALTER TABLE "session" DROP COLUMN "isPrivate"`);
        await queryRunner.query(`DROP INDEX "IDX_f3095c2076a1d79e4cbe889e66"`);
        await queryRunner.query(`DROP INDEX "IDX_4a4de9a5594235fb215ebf18bd"`);
        await queryRunner.query(`DROP TABLE "invited_users"`);
    }

}
