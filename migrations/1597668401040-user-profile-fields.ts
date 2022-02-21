import {MigrationInterface, QueryRunner} from "typeorm";

export class userProfileFields1597668401040 implements MigrationInterface {
    name = 'userProfileFields1597668401040'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "full_name" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD "background_image" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD "avatar" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD "bio" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD "location" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD "website" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "website"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "location"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "bio"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "avatar"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "background_image"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "full_name"`);
    }

}
