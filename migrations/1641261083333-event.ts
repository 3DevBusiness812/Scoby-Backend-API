import {MigrationInterface, QueryRunner} from "typeorm";

export class event1641261083333 implements MigrationInterface {
    name = 'event1641261083333'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "event" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "description" character varying NOT NULL, "day" character varying NOT NULL, "start_event" TIME NOT NULL, "end_event" TIME NOT NULL, "background_image" character varying, "avatar" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "finished_at" TIMESTAMP, "owner_user_id" integer NOT NULL, "sessionId" integer, CONSTRAINT "REL_095e9a5da8755583ff4b0fb621" UNIQUE ("sessionId"), CONSTRAINT "PK_30c2f3bbaf6d34a55f8ae6e4614" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "events_topics" ("event_id" integer NOT NULL, "topic_id" integer NOT NULL, CONSTRAINT "PK_75285724726e3b3ae053344b2b8" PRIMARY KEY ("event_id", "topic_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_249cf9bde23e9cec95de535f80" ON "events_topics" ("event_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_7d72336451770c4f69c44bb30e" ON "events_topics" ("topic_id") `);
        await queryRunner.query(`CREATE TABLE "events_subscribed_users" ("event_id" integer NOT NULL, "user_id" integer NOT NULL, CONSTRAINT "PK_051c1cf7668366c050b0b987958" PRIMARY KEY ("event_id", "user_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_6b0ba646f78ea96fc95ee4c5e3" ON "events_subscribed_users" ("event_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_8ffc21a16e88fb62fb2b8176b2" ON "events_subscribed_users" ("user_id") `);
        await queryRunner.query(`ALTER TABLE "event" ADD CONSTRAINT "FK_44b514d39959dc2adca1127805e" FOREIGN KEY ("owner_user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "event" ADD CONSTRAINT "FK_095e9a5da8755583ff4b0fb621d" FOREIGN KEY ("sessionId") REFERENCES "session"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "events_topics" ADD CONSTRAINT "FK_249cf9bde23e9cec95de535f80b" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "events_topics" ADD CONSTRAINT "FK_7d72336451770c4f69c44bb30e0" FOREIGN KEY ("topic_id") REFERENCES "topic"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "events_subscribed_users" ADD CONSTRAINT "FK_6b0ba646f78ea96fc95ee4c5e32" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "events_subscribed_users" ADD CONSTRAINT "FK_8ffc21a16e88fb62fb2b8176b2e" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "events_subscribed_users" DROP CONSTRAINT "FK_8ffc21a16e88fb62fb2b8176b2e"`);
        await queryRunner.query(`ALTER TABLE "events_subscribed_users" DROP CONSTRAINT "FK_6b0ba646f78ea96fc95ee4c5e32"`);
        await queryRunner.query(`ALTER TABLE "events_topics" DROP CONSTRAINT "FK_7d72336451770c4f69c44bb30e0"`);
        await queryRunner.query(`ALTER TABLE "events_topics" DROP CONSTRAINT "FK_249cf9bde23e9cec95de535f80b"`);
        await queryRunner.query(`ALTER TABLE "event" DROP CONSTRAINT "FK_095e9a5da8755583ff4b0fb621d"`);
        await queryRunner.query(`ALTER TABLE "event" DROP CONSTRAINT "FK_44b514d39959dc2adca1127805e"`);
        await queryRunner.query(`DROP INDEX "IDX_8ffc21a16e88fb62fb2b8176b2"`);
        await queryRunner.query(`DROP INDEX "IDX_6b0ba646f78ea96fc95ee4c5e3"`);
        await queryRunner.query(`DROP TABLE "events_subscribed_users"`);
        await queryRunner.query(`DROP INDEX "IDX_7d72336451770c4f69c44bb30e"`);
        await queryRunner.query(`DROP INDEX "IDX_249cf9bde23e9cec95de535f80"`);
        await queryRunner.query(`DROP TABLE "events_topics"`);
        await queryRunner.query(`DROP TABLE "event"`);
    }

}
