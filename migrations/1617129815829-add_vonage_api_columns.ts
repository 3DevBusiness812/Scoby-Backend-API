import {MigrationInterface, QueryRunner} from "typeorm";

export class addVonageApiColumns1617129815829 implements MigrationInterface {
    name = 'addVonageApiColumns1617129815829'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "vonage_user_token" character varying`);
        await queryRunner.query(`ALTER TABLE "session" ADD "vonage_session_token" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "session" DROP COLUMN "vonage_session_token"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "vonage_user_token"`);
    }
}
