import {MigrationInterface, QueryRunner} from "typeorm";

export class usersFollowUsersCreatedAt1609264791932 implements MigrationInterface {
    name = 'usersFollowUsersCreatedAt1609264791932'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users_follow_users" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users_follow_users" DROP COLUMN "created_at"`);
    }

}
