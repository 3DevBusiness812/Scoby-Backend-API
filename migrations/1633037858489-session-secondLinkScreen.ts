import {MigrationInterface, QueryRunner} from "typeorm";

export class sessionSecondLinkScreen1633037858489 implements MigrationInterface {
    name = 'sessionSecondLinkScreen1633037858489'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "session" ADD "secondScreenLink" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "session" DROP COLUMN "secondScreenLink"`);
    }

}
