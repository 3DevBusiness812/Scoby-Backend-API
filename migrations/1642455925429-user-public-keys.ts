import {MigrationInterface, QueryRunner} from "typeorm";

export class userPublicKeys1642455925429 implements MigrationInterface {
    name = 'userPublicKeys1642455925429'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "public_key" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "public_key"`);
    }

}
