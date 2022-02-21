import {MigrationInterface, QueryRunner} from "typeorm";

export class activityRead1633576547650 implements MigrationInterface {
    name = 'activityRead1633576547650'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "activity_read" ("id" SERIAL NOT NULL, "id_user" integer NOT NULL, "id_activity" integer NOT NULL, CONSTRAINT "PK_15deff527afdcf680add8d7a84f" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "activity_read"`);
    }

}
