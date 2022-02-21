import {MigrationInterface, QueryRunner} from "typeorm";

export class teamSettings1636718045845 implements MigrationInterface {
    name = 'teamSettings1636718045845'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "team_teamtype_enum" AS ENUM('Private', 'Public', 'Secret')`);
        await queryRunner.query(`ALTER TABLE "team" ADD "teamType" "team_teamtype_enum" NOT NULL DEFAULT 'Public'`);
        await queryRunner.query(`ALTER TABLE "team" ADD "membersAllowedToHost" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "team" ADD "membersAllowedToInvite" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "team" DROP COLUMN "membersAllowedToInvite"`);
        await queryRunner.query(`ALTER TABLE "team" DROP COLUMN "membersAllowedToHost"`);
        await queryRunner.query(`ALTER TABLE "team" DROP COLUMN "teamType"`);
        await queryRunner.query(`DROP TYPE "team_teamtype_enum"`);
    }

}
