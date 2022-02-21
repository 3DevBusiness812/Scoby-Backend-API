import {MigrationInterface, QueryRunner} from "typeorm";

export class sessionsTopics1615958741745 implements MigrationInterface {
    name = 'sessionsTopics1615958741745'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "sessions_topics" ("session_id" integer NOT NULL, "topic_id" integer NOT NULL, CONSTRAINT "PK_1ca4c95dee6a16ed82a762362dd" PRIMARY KEY ("session_id", "topic_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_6cf1e7d395c7021a584cff058a" ON "sessions_topics" ("session_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_493cdc9fc300274e91fe090b55" ON "sessions_topics" ("topic_id") `);
        await queryRunner.query(`ALTER TABLE "session" ADD "title" character varying`);
        await queryRunner.query(`ALTER TABLE "sessions_topics" ADD CONSTRAINT "FK_6cf1e7d395c7021a584cff058a8" FOREIGN KEY ("session_id") REFERENCES "session"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sessions_topics" ADD CONSTRAINT "FK_493cdc9fc300274e91fe090b554" FOREIGN KEY ("topic_id") REFERENCES "topic"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sessions_topics" DROP CONSTRAINT "FK_493cdc9fc300274e91fe090b554"`);
        await queryRunner.query(`ALTER TABLE "sessions_topics" DROP CONSTRAINT "FK_6cf1e7d395c7021a584cff058a8"`);
        await queryRunner.query(`ALTER TABLE "session" DROP COLUMN "title"`);
        await queryRunner.query(`DROP INDEX "IDX_493cdc9fc300274e91fe090b55"`);
        await queryRunner.query(`DROP INDEX "IDX_6cf1e7d395c7021a584cff058a"`);
        await queryRunner.query(`DROP TABLE "sessions_topics"`);
    }

}
