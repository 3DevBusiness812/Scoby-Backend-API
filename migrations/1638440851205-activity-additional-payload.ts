import {MigrationInterface, QueryRunner} from "typeorm";

export class activityAdditionalPayload1638440851205 implements MigrationInterface {
    name = 'activityAdditionalPayload1638440851205'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "activity" ADD "additionalPayload" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "activity" DROP COLUMN "additionalPayload"`);
    }

}
