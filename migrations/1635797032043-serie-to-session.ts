import {MigrationInterface, QueryRunner} from "typeorm";

export class serieToSession1635797032043 implements MigrationInterface {
    name = 'serieToSession1635797032043'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "series" ADD "sessionId" integer`);
        await queryRunner.query(`ALTER TABLE "series" ADD CONSTRAINT "UQ_2f5e3b402f1ffaf85f97f2eb0c6" UNIQUE ("sessionId")`);
        await queryRunner.query(`ALTER TABLE "series" ADD CONSTRAINT "FK_2f5e3b402f1ffaf85f97f2eb0c6" FOREIGN KEY ("sessionId") REFERENCES "session"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "series" DROP CONSTRAINT "FK_2f5e3b402f1ffaf85f97f2eb0c6"`);
        await queryRunner.query(`ALTER TABLE "series" DROP CONSTRAINT "UQ_2f5e3b402f1ffaf85f97f2eb0c6"`);
        await queryRunner.query(`ALTER TABLE "series" DROP COLUMN "sessionId"`);
    }

}
