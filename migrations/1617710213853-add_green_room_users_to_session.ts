import {MigrationInterface, QueryRunner} from "typeorm";

export class addGreenRoomUsersToSession1617710213853 implements MigrationInterface {
    name = 'addGreenRoomUsersToSession1617710213853'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "green_room_users" ("session_id" integer NOT NULL, "user_id" integer NOT NULL, CONSTRAINT "PK_503442d973d91a72a9aa8a1841c" PRIMARY KEY ("session_id", "user_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_b39317430fdd9d7a6a93593188" ON "green_room_users" ("session_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_78f62d18f58d9f4aa7f0312d20" ON "green_room_users" ("user_id") `);
        await queryRunner.query(`ALTER TABLE "green_room_users" ADD CONSTRAINT "FK_b39317430fdd9d7a6a93593188e" FOREIGN KEY ("session_id") REFERENCES "session"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "green_room_users" ADD CONSTRAINT "FK_78f62d18f58d9f4aa7f0312d209" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "green_room_users" DROP CONSTRAINT "FK_78f62d18f58d9f4aa7f0312d209"`);
        await queryRunner.query(`ALTER TABLE "green_room_users" DROP CONSTRAINT "FK_b39317430fdd9d7a6a93593188e"`);
        await queryRunner.query(`DROP INDEX "IDX_78f62d18f58d9f4aa7f0312d20"`);
        await queryRunner.query(`DROP INDEX "IDX_b39317430fdd9d7a6a93593188"`);
        await queryRunner.query(`DROP TABLE "green_room_users"`);
    }

}
