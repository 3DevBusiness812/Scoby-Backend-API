import {MigrationInterface, QueryRunner} from "typeorm";

export class usersFollowersFollowing1608303847737 implements MigrationInterface {
    name = 'usersFollowersFollowing1608303847737'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users_follow_users" ("source_user_id" integer NOT NULL, "target_user_id" integer NOT NULL, CONSTRAINT "PK_4b86cba4facb8177e8eb825a682" PRIMARY KEY ("source_user_id", "target_user_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_c102ade309e5c881ca3ac2e714" ON "users_follow_users" ("source_user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_8dbdc639fc8732804135839edd" ON "users_follow_users" ("target_user_id") `);
        await queryRunner.query(`ALTER TABLE "users_follow_users" ADD CONSTRAINT "FK_c102ade309e5c881ca3ac2e714a" FOREIGN KEY ("source_user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users_follow_users" ADD CONSTRAINT "FK_8dbdc639fc8732804135839edd3" FOREIGN KEY ("target_user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users_follow_users" DROP CONSTRAINT "FK_8dbdc639fc8732804135839edd3"`);
        await queryRunner.query(`ALTER TABLE "users_follow_users" DROP CONSTRAINT "FK_c102ade309e5c881ca3ac2e714a"`);
        await queryRunner.query(`DROP INDEX "IDX_8dbdc639fc8732804135839edd"`);
        await queryRunner.query(`DROP INDEX "IDX_c102ade309e5c881ca3ac2e714"`);
        await queryRunner.query(`DROP TABLE "users_follow_users"`);
    }

}
