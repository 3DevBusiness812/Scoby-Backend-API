import {MigrationInterface, QueryRunner} from "typeorm";

export class session1601299262229 implements MigrationInterface {
    name = 'session1601299262229'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "session" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "finished_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "owner_user_id" integer NOT NULL, CONSTRAINT "PK_f55da76ac1c3ac420f444d2ff11" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "sessions_participant_users" ("session_id" integer NOT NULL, "user_id" integer NOT NULL, CONSTRAINT "PK_ada1ee5d14332e19d3036b10ca8" PRIMARY KEY ("session_id", "user_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_b8c6ea7c2134237e10e0f38b77" ON "sessions_participant_users" ("session_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_96946a95d35ee89a67da57e244" ON "sessions_participant_users" ("user_id") `);
        await queryRunner.query(`ALTER TABLE "session" ADD CONSTRAINT "FK_12ed6cdb5242cf82bf3faa83c97" FOREIGN KEY ("owner_user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sessions_participant_users" ADD CONSTRAINT "FK_b8c6ea7c2134237e10e0f38b77d" FOREIGN KEY ("session_id") REFERENCES "session"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sessions_participant_users" ADD CONSTRAINT "FK_96946a95d35ee89a67da57e2448" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sessions_participant_users" DROP CONSTRAINT "FK_96946a95d35ee89a67da57e2448"`);
        await queryRunner.query(`ALTER TABLE "sessions_participant_users" DROP CONSTRAINT "FK_b8c6ea7c2134237e10e0f38b77d"`);
        await queryRunner.query(`ALTER TABLE "session" DROP CONSTRAINT "FK_12ed6cdb5242cf82bf3faa83c97"`);
        await queryRunner.query(`DROP INDEX "IDX_96946a95d35ee89a67da57e244"`);
        await queryRunner.query(`DROP INDEX "IDX_b8c6ea7c2134237e10e0f38b77"`);
        await queryRunner.query(`DROP TABLE "sessions_participant_users"`);
        await queryRunner.query(`DROP TABLE "session"`);
    }

}
