import {MigrationInterface, QueryRunner} from "typeorm";

export class addChatRoomDeleteCascade1633622156453 implements MigrationInterface {
    name = 'addChatRoomDeleteCascade1633622156453'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chat_message" DROP CONSTRAINT "FK_a6d9cc3fdadd1b71f36ad2a4487"`);
        await queryRunner.query(`ALTER TABLE "chat_message" ADD CONSTRAINT "FK_a6d9cc3fdadd1b71f36ad2a4487" FOREIGN KEY ("room_id") REFERENCES "chat_room"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chat_message" DROP CONSTRAINT "FK_a6d9cc3fdadd1b71f36ad2a4487"`);
        await queryRunner.query(`ALTER TABLE "chat_message" ADD CONSTRAINT "FK_a6d9cc3fdadd1b71f36ad2a4487" FOREIGN KEY ("room_id") REFERENCES "chat_room"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
