import {MigrationInterface, QueryRunner} from "typeorm";

export class seriesImages1634344259115 implements MigrationInterface {
    name = 'seriesImages1634344259115'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "series" ADD "background_image" character varying`);
        await queryRunner.query(`ALTER TABLE "series" ADD "avatar" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "series" DROP COLUMN "avatar"`);
        await queryRunner.query(`ALTER TABLE "series" DROP COLUMN "background_image"`);
    }

}
