import {MigrationInterface, QueryRunner} from "typeorm";

export class chat1632986410445 implements MigrationInterface {
    name = 'chat1632986410445'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "chat_room" ("id" integer NOT NULL, CONSTRAINT "PK_8aa3a52cf74c96469f0ef9fbe3e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "chat_message" ("id" integer NOT NULL, "text" character varying NOT NULL, "sender_id" integer NOT NULL, "room_id" integer NOT NULL, CONSTRAINT "PK_3cc0d85193aade457d3077dd06b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "chat_room_participants" ("chat_room_id" integer NOT NULL, "users_id" integer NOT NULL, CONSTRAINT "PK_faf25b12a52e8b8b1200bfca9ac" PRIMARY KEY ("chat_room_id", "users_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_cf8f507d699d0cd5db3d9276ba" ON "chat_room_participants" ("chat_room_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_d23b4d82f80f8729d9b5bc0c4b" ON "chat_room_participants" ("users_id") `);
        await queryRunner.query(`ALTER TABLE "chat_message" ADD CONSTRAINT "FK_bd00cce706735f1c4d05c69a310" FOREIGN KEY ("sender_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chat_message" ADD CONSTRAINT "FK_a6d9cc3fdadd1b71f36ad2a4487" FOREIGN KEY ("room_id") REFERENCES "chat_room"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chat_room_participants" ADD CONSTRAINT "FK_cf8f507d699d0cd5db3d9276ba6" FOREIGN KEY ("chat_room_id") REFERENCES "chat_room"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chat_room_participants" ADD CONSTRAINT "FK_d23b4d82f80f8729d9b5bc0c4b3" FOREIGN KEY ("users_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chat_room_participants" DROP CONSTRAINT "FK_d23b4d82f80f8729d9b5bc0c4b3"`);
        await queryRunner.query(`ALTER TABLE "chat_room_participants" DROP CONSTRAINT "FK_cf8f507d699d0cd5db3d9276ba6"`);
        await queryRunner.query(`ALTER TABLE "chat_message" DROP CONSTRAINT "FK_a6d9cc3fdadd1b71f36ad2a4487"`);
        await queryRunner.query(`ALTER TABLE "chat_message" DROP CONSTRAINT "FK_bd00cce706735f1c4d05c69a310"`);
        await queryRunner.query(`DROP INDEX "IDX_d23b4d82f80f8729d9b5bc0c4b"`);
        await queryRunner.query(`DROP INDEX "IDX_cf8f507d699d0cd5db3d9276ba"`);
        await queryRunner.query(`DROP TABLE "chat_room_participants"`);
        await queryRunner.query(`DROP TABLE "chat_message"`);
        await queryRunner.query(`DROP TABLE "chat_room"`);
    }

}
