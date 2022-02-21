import {MigrationInterface, QueryRunner} from "typeorm";

export class verifiedPublicKey1643664428257 implements MigrationInterface {
    name = 'verifiedPublicKey1643664428257'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "verified_public_key" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "verified_public_key"`);
    }

}
