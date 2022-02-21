import {MigrationInterface, QueryRunner} from "typeorm";

export class serieSchedule1636058576509 implements MigrationInterface {
    name = 'serieSchedule1636058576509'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "schedule" ("id" SERIAL NOT NULL, "day" character varying NOT NULL, "start_serie" TIME NOT NULL, "end_serie" TIME NOT NULL, "id_serie" integer NOT NULL, CONSTRAINT "PK_ed544c511e25281ab7c7666cc87" PRIMARY KEY ("id", "id_serie"))`);
        await queryRunner.query(`CREATE INDEX "IDX_4e0a62303beead3c085321b6a7" ON "schedule" ("id_serie") `);
        await queryRunner.query(`ALTER TABLE "series" DROP COLUMN "schedule"`);
        await queryRunner.query(`ALTER TABLE "schedule" ADD CONSTRAINT "FK_4e0a62303beead3c085321b6a79" FOREIGN KEY ("id_serie") REFERENCES "series"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "schedule" DROP CONSTRAINT "FK_4e0a62303beead3c085321b6a79"`);
        await queryRunner.query(`ALTER TABLE "series" ADD "schedule" character varying NOT NULL`);
        await queryRunner.query(`DROP INDEX "IDX_4e0a62303beead3c085321b6a7"`);
        await queryRunner.query(`DROP TABLE "schedule"`);
    }

}
