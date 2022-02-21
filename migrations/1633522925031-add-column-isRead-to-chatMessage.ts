import {MigrationInterface, QueryRunner} from "typeorm";

export class addColumnIsReadToChatMessage1633522925031 implements MigrationInterface {
    name = 'addColumnIsReadToChatMessage1633522925031'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chat_message" ADD "isRead" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chat_message" DROP COLUMN "isRead"`);
    }

}
