import {MigrationInterface, QueryRunner} from "typeorm";

export class series1634174161170 implements MigrationInterface {
    name = 'series1634174161170'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "series" ("id" SERIAL NOT NULL, "calendarName" character varying NOT NULL, "className" character varying NOT NULL, "seriesName" character varying NOT NULL, "schedule" character varying NOT NULL, "description" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "finished_at" TIMESTAMP, "owner_user_id" integer NOT NULL, CONSTRAINT "PK_e725676647382eb54540d7128ba" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "series_topics" ("series_id" integer NOT NULL, "topic_id" integer NOT NULL, CONSTRAINT "PK_0001289db6881a661908483aebe" PRIMARY KEY ("series_id", "topic_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_d214a11d7c9adfa761b47ea0f9" ON "series_topics" ("series_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_57948c170fb4c69c89dc2b7323" ON "series_topics" ("topic_id") `);
        await queryRunner.query(`CREATE TABLE "series_subscribed_users" ("session_id" integer NOT NULL, "user_id" integer NOT NULL, CONSTRAINT "PK_836592a663f632c3c75042075e1" PRIMARY KEY ("session_id", "user_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_2a3642ae088f9affb42e4bf06e" ON "series_subscribed_users" ("session_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_4d0e8b12b7bbb77ca6e65c088b" ON "series_subscribed_users" ("user_id") `);
        await queryRunner.query(`ALTER TABLE "series" ADD CONSTRAINT "FK_cadd77dad5cd5104e1db436a356" FOREIGN KEY ("owner_user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "series_topics" ADD CONSTRAINT "FK_d214a11d7c9adfa761b47ea0f90" FOREIGN KEY ("series_id") REFERENCES "series"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "series_topics" ADD CONSTRAINT "FK_57948c170fb4c69c89dc2b73239" FOREIGN KEY ("topic_id") REFERENCES "topic"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "series_subscribed_users" ADD CONSTRAINT "FK_2a3642ae088f9affb42e4bf06e5" FOREIGN KEY ("session_id") REFERENCES "series"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "series_subscribed_users" ADD CONSTRAINT "FK_4d0e8b12b7bbb77ca6e65c088bd" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "series_subscribed_users" DROP CONSTRAINT "FK_4d0e8b12b7bbb77ca6e65c088bd"`);
        await queryRunner.query(`ALTER TABLE "series_subscribed_users" DROP CONSTRAINT "FK_2a3642ae088f9affb42e4bf06e5"`);
        await queryRunner.query(`ALTER TABLE "series_topics" DROP CONSTRAINT "FK_57948c170fb4c69c89dc2b73239"`);
        await queryRunner.query(`ALTER TABLE "series_topics" DROP CONSTRAINT "FK_d214a11d7c9adfa761b47ea0f90"`);
        await queryRunner.query(`ALTER TABLE "series" DROP CONSTRAINT "FK_cadd77dad5cd5104e1db436a356"`);
        await queryRunner.query(`DROP INDEX "IDX_4d0e8b12b7bbb77ca6e65c088b"`);
        await queryRunner.query(`DROP INDEX "IDX_2a3642ae088f9affb42e4bf06e"`);
        await queryRunner.query(`DROP TABLE "series_subscribed_users"`);
        await queryRunner.query(`DROP INDEX "IDX_57948c170fb4c69c89dc2b7323"`);
        await queryRunner.query(`DROP INDEX "IDX_d214a11d7c9adfa761b47ea0f9"`);
        await queryRunner.query(`DROP TABLE "series_topics"`);
        await queryRunner.query(`DROP TABLE "series"`);
    }

}
