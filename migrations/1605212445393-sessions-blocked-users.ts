import {MigrationInterface, QueryRunner} from "typeorm";

export class sessionsBlockedUsers1605212445393 implements MigrationInterface {
    name = 'sessionsBlockedUsers1605212445393'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "sessions_blocked_users" ("session_id" integer NOT NULL, "user_id" integer NOT NULL, CONSTRAINT "PK_5d6f50697ce960be57084a5f38c" PRIMARY KEY ("session_id", "user_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_8b22a59128fc87402a0c976218" ON "sessions_blocked_users" ("session_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_c1b9c3b9f68ca97b238f164fcf" ON "sessions_blocked_users" ("user_id") `);
        await queryRunner.query(`ALTER TABLE "sessions_blocked_users" ADD CONSTRAINT "FK_8b22a59128fc87402a0c9762185" FOREIGN KEY ("session_id") REFERENCES "session"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sessions_blocked_users" ADD CONSTRAINT "FK_c1b9c3b9f68ca97b238f164fcf7" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sessions_blocked_users" DROP CONSTRAINT "FK_c1b9c3b9f68ca97b238f164fcf7"`);
        await queryRunner.query(`ALTER TABLE "sessions_blocked_users" DROP CONSTRAINT "FK_8b22a59128fc87402a0c9762185"`);
        await queryRunner.query(`DROP INDEX "IDX_c1b9c3b9f68ca97b238f164fcf"`);
        await queryRunner.query(`DROP INDEX "IDX_8b22a59128fc87402a0c976218"`);
        await queryRunner.query(`DROP TABLE "sessions_blocked_users"`);
    }

}
