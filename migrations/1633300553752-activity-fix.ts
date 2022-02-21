import {MigrationInterface, QueryRunner} from "typeorm";

export class activityFix1633300553752 implements MigrationInterface {
    name = 'activityFix1633300553752'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "activity" DROP COLUMN "procedure_action"`);
        await queryRunner.query(`ALTER TABLE "activity" ADD "procedure_action" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "activity" DROP COLUMN "procedure_action"`);
        await queryRunner.query(`ALTER TABLE "activity" ADD "procedure_action" character varying NOT NULL`);
    }

}
