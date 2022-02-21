import {MigrationInterface, QueryRunner} from "typeorm";

export class teamImages1636501519406 implements MigrationInterface {
    name = 'teamImages1636501519406'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "team" ADD "background_image" character varying`);
        await queryRunner.query(`ALTER TABLE "team" ADD "avatar" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "team" DROP COLUMN "avatar"`);
        await queryRunner.query(`ALTER TABLE "team" DROP COLUMN "background_image"`);
    }

}
