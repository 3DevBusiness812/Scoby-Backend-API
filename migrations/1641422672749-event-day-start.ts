import {MigrationInterface, QueryRunner} from "typeorm";

export class eventDayStart1641422672749 implements MigrationInterface {
    name = 'eventDayStart1641422672749'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event" RENAME COLUMN "day" TO "day_event"`);
        await queryRunner.query(`ALTER TABLE "event" DROP COLUMN "day_event"`);
        await queryRunner.query(`ALTER TABLE "event" ADD "day_event" date NOT NULL DEFAULT '1/1/2022'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event" DROP COLUMN "day_event"`);
        await queryRunner.query(`ALTER TABLE "event" ADD "day_event" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "event" RENAME COLUMN "day_event" TO "day"`);
    }

}
