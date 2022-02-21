import {MigrationInterface, QueryRunner} from "typeorm";

export class seriesClassNameCalendarNameNull1641260901619 implements MigrationInterface {
    name = 'seriesClassNameCalendarNameNull1641260901619'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "series" ALTER COLUMN "calendarName" DROP NOT NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "series"."calendarName" IS NULL`);
        await queryRunner.query(`ALTER TABLE "series" ALTER COLUMN "className" DROP NOT NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "series"."className" IS NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`COMMENT ON COLUMN "series"."className" IS NULL`);
        await queryRunner.query(`ALTER TABLE "series" ALTER COLUMN "className" SET NOT NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "series"."calendarName" IS NULL`);
        await queryRunner.query(`ALTER TABLE "series" ALTER COLUMN "calendarName" SET NOT NULL`);
    }

}
