import {MigrationInterface, QueryRunner} from "typeorm";

export class eventFixDay1643675475890 implements MigrationInterface {
    name = 'eventFixDay1643675475890'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`COMMENT ON COLUMN "event"."day_event" IS NULL`);
        await queryRunner.query(`ALTER TABLE "event" ALTER COLUMN "day_event" DROP DEFAULT`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event" ALTER COLUMN "day_event" SET DEFAULT '2022-01-01'`);
        await queryRunner.query(`COMMENT ON COLUMN "event"."day_event" IS NULL`);
    }

}
