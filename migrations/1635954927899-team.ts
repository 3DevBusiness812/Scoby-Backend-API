import {MigrationInterface, QueryRunner} from "typeorm";

export class team1635954927899 implements MigrationInterface {
    name = 'team1635954927899'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "team" ("id" SERIAL NOT NULL, "name" character varying, "description" character varying, "linkWebsite" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "finished_at" TIMESTAMP, "owner_user_id" integer NOT NULL, CONSTRAINT "PK_f57d8293406df4af348402e4b74" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "teams_topics" ("team_id" integer NOT NULL, "topic_id" integer NOT NULL, CONSTRAINT "PK_45bf4bbd8d15eb4ec4f04fc94d2" PRIMARY KEY ("team_id", "topic_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_5f5680abd8678ba118fdcfc267" ON "teams_topics" ("team_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_e548b25fa65ea52105c7c9b887" ON "teams_topics" ("topic_id") `);
        await queryRunner.query(`CREATE TABLE "teams_participant_users" ("team_id" integer NOT NULL, "user_id" integer NOT NULL, CONSTRAINT "PK_1805b12079fd1cd9176fb845180" PRIMARY KEY ("team_id", "user_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_5b2c69415cbf9e6712fbc5ed96" ON "teams_participant_users" ("team_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_140d18b2fc1fbac226c582e97f" ON "teams_participant_users" ("user_id") `);
        await queryRunner.query(`ALTER TABLE "team" ADD CONSTRAINT "FK_217b3e74ec6324a561e345ee49f" FOREIGN KEY ("owner_user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "teams_topics" ADD CONSTRAINT "FK_5f5680abd8678ba118fdcfc2676" FOREIGN KEY ("team_id") REFERENCES "team"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "teams_topics" ADD CONSTRAINT "FK_e548b25fa65ea52105c7c9b8870" FOREIGN KEY ("topic_id") REFERENCES "topic"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "teams_participant_users" ADD CONSTRAINT "FK_5b2c69415cbf9e6712fbc5ed963" FOREIGN KEY ("team_id") REFERENCES "team"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "teams_participant_users" ADD CONSTRAINT "FK_140d18b2fc1fbac226c582e97f1" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "teams_participant_users" DROP CONSTRAINT "FK_140d18b2fc1fbac226c582e97f1"`);
        await queryRunner.query(`ALTER TABLE "teams_participant_users" DROP CONSTRAINT "FK_5b2c69415cbf9e6712fbc5ed963"`);
        await queryRunner.query(`ALTER TABLE "teams_topics" DROP CONSTRAINT "FK_e548b25fa65ea52105c7c9b8870"`);
        await queryRunner.query(`ALTER TABLE "teams_topics" DROP CONSTRAINT "FK_5f5680abd8678ba118fdcfc2676"`);
        await queryRunner.query(`ALTER TABLE "team" DROP CONSTRAINT "FK_217b3e74ec6324a561e345ee49f"`);
        await queryRunner.query(`DROP INDEX "IDX_140d18b2fc1fbac226c582e97f"`);
        await queryRunner.query(`DROP INDEX "IDX_5b2c69415cbf9e6712fbc5ed96"`);
        await queryRunner.query(`DROP TABLE "teams_participant_users"`);
        await queryRunner.query(`DROP INDEX "IDX_e548b25fa65ea52105c7c9b887"`);
        await queryRunner.query(`DROP INDEX "IDX_5f5680abd8678ba118fdcfc267"`);
        await queryRunner.query(`DROP TABLE "teams_topics"`);
        await queryRunner.query(`DROP TABLE "team"`);
    }

}
