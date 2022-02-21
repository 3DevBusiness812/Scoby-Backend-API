import {MigrationInterface, QueryRunner} from "typeorm";

export class userEmail1605613630991 implements MigrationInterface {
    name = 'userEmail1605613630991'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "email" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "email"`);
    }

}
