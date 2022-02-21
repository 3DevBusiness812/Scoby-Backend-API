import {MigrationInterface, QueryRunner} from "typeorm";

export class chatUpdate1633005180128 implements MigrationInterface {
    name = 'chatUpdate1633005180128'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chat_message" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "chat_message" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "chat_message" DROP CONSTRAINT "FK_a6d9cc3fdadd1b71f36ad2a4487"`);
        await queryRunner.query(`ALTER TABLE "chat_room_participants" DROP CONSTRAINT "FK_cf8f507d699d0cd5db3d9276ba6"`);
        await queryRunner.query(`COMMENT ON COLUMN "chat_room"."id" IS NULL`);
        await queryRunner.query(`CREATE SEQUENCE "chat_room_id_seq" OWNED BY "chat_room"."id"`);
        await queryRunner.query(`ALTER TABLE "chat_room" ALTER COLUMN "id" SET DEFAULT nextval('chat_room_id_seq')`);
        await queryRunner.query(`COMMENT ON COLUMN "chat_message"."id" IS NULL`);
        await queryRunner.query(`CREATE SEQUENCE "chat_message_id_seq" OWNED BY "chat_message"."id"`);
        await queryRunner.query(`ALTER TABLE "chat_message" ALTER COLUMN "id" SET DEFAULT nextval('chat_message_id_seq')`);
        await queryRunner.query(`ALTER TABLE "chat_message" ADD CONSTRAINT "FK_a6d9cc3fdadd1b71f36ad2a4487" FOREIGN KEY ("room_id") REFERENCES "chat_room"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chat_room_participants" ADD CONSTRAINT "FK_cf8f507d699d0cd5db3d9276ba6" FOREIGN KEY ("chat_room_id") REFERENCES "chat_room"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chat_room_participants" DROP CONSTRAINT "FK_cf8f507d699d0cd5db3d9276ba6"`);
        await queryRunner.query(`ALTER TABLE "chat_message" DROP CONSTRAINT "FK_a6d9cc3fdadd1b71f36ad2a4487"`);
        await queryRunner.query(`ALTER TABLE "chat_message" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`DROP SEQUENCE "chat_message_id_seq"`);
        await queryRunner.query(`COMMENT ON COLUMN "chat_message"."id" IS NULL`);
        await queryRunner.query(`ALTER TABLE "chat_room" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`DROP SEQUENCE "chat_room_id_seq"`);
        await queryRunner.query(`COMMENT ON COLUMN "chat_room"."id" IS NULL`);
        await queryRunner.query(`ALTER TABLE "chat_room_participants" ADD CONSTRAINT "FK_cf8f507d699d0cd5db3d9276ba6" FOREIGN KEY ("chat_room_id") REFERENCES "chat_room"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chat_message" ADD CONSTRAINT "FK_a6d9cc3fdadd1b71f36ad2a4487" FOREIGN KEY ("room_id") REFERENCES "chat_room"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chat_message" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "chat_message" DROP COLUMN "created_at"`);
    }

}
