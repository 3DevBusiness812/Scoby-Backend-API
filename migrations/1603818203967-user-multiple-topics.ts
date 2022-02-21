import {MigrationInterface, QueryRunner} from "typeorm";

export class userMultipleTopics1603818203967 implements MigrationInterface {
    name = 'userMultipleTopics1603818203967'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_73f13c58a72b763e49c5c4c8c45"`);
        await queryRunner.query(`CREATE TABLE "users_topics" ("user_id" integer NOT NULL, "topic_id" integer NOT NULL, CONSTRAINT "PK_1a2e67522bd7a2b1bf5b0c918bf" PRIMARY KEY ("user_id", "topic_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_8008c2eeba511cb789be79e6bb" ON "users_topics" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_d7cda5478d6f5d4f8401266419" ON "users_topics" ("topic_id") `);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "topic_id"`);
        await queryRunner.query(`ALTER TABLE "users_topics" ADD CONSTRAINT "FK_8008c2eeba511cb789be79e6bb7" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users_topics" ADD CONSTRAINT "FK_d7cda5478d6f5d4f8401266419d" FOREIGN KEY ("topic_id") REFERENCES "topic"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users_topics" DROP CONSTRAINT "FK_d7cda5478d6f5d4f8401266419d"`);
        await queryRunner.query(`ALTER TABLE "users_topics" DROP CONSTRAINT "FK_8008c2eeba511cb789be79e6bb7"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "topic_id" integer`);
        await queryRunner.query(`DROP INDEX "IDX_d7cda5478d6f5d4f8401266419"`);
        await queryRunner.query(`DROP INDEX "IDX_8008c2eeba511cb789be79e6bb"`);
        await queryRunner.query(`DROP TABLE "users_topics"`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_73f13c58a72b763e49c5c4c8c45" FOREIGN KEY ("topic_id") REFERENCES "topic"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
