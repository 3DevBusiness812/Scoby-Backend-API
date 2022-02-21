import {MigrationInterface, QueryRunner} from "typeorm";

export class userVerificationLimit1642202629751 implements MigrationInterface {
    name = 'userVerificationLimit1642202629751'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "verification_limit" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`COMMENT ON COLUMN "event"."day_event" IS NULL`);
        await queryRunner.query(`ALTER TABLE "event" ALTER COLUMN "day_event" SET DEFAULT '1/1/2022'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event" ALTER COLUMN "day_event" SET DEFAULT '2022-01-01'`);
        await queryRunner.query(`COMMENT ON COLUMN "event"."day_event" IS NULL`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "verification_limit"`);
    }

}
