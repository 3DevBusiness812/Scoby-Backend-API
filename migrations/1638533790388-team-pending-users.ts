import {MigrationInterface, QueryRunner} from "typeorm";

export class teamPendingUsers1638533790388 implements MigrationInterface {
    name = 'teamPendingUsers1638533790388'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "teams_pending_users" ("team_id" integer NOT NULL, "user_id" integer NOT NULL, CONSTRAINT "PK_e37bb9db9ff99cc6fb6cf144ef7" PRIMARY KEY ("team_id", "user_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_670bd031d513a6204f13050da5" ON "teams_pending_users" ("team_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_fb6d8ce865cbe993bd0f6307a8" ON "teams_pending_users" ("user_id") `);
        await queryRunner.query(`ALTER TABLE "teams_pending_users" ADD CONSTRAINT "FK_670bd031d513a6204f13050da5a" FOREIGN KEY ("team_id") REFERENCES "team"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "teams_pending_users" ADD CONSTRAINT "FK_fb6d8ce865cbe993bd0f6307a8a" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "teams_pending_users" DROP CONSTRAINT "FK_fb6d8ce865cbe993bd0f6307a8a"`);
        await queryRunner.query(`ALTER TABLE "teams_pending_users" DROP CONSTRAINT "FK_670bd031d513a6204f13050da5a"`);
        await queryRunner.query(`DROP INDEX "IDX_fb6d8ce865cbe993bd0f6307a8"`);
        await queryRunner.query(`DROP INDEX "IDX_670bd031d513a6204f13050da5"`);
        await queryRunner.query(`DROP TABLE "teams_pending_users"`);
    }

}
