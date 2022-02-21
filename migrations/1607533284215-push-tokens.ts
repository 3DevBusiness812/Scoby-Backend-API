import {MigrationInterface, QueryRunner} from "typeorm";

export class pushTokens1607533284215 implements MigrationInterface {
    name = 'pushTokens1607533284215'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "push_token" ("id" SERIAL NOT NULL, "token" character varying NOT NULL, "device_id" character varying NOT NULL, "user_id" integer NOT NULL, CONSTRAINT "UQ_ae6853aba3ad5fe0b6b0db15024" UNIQUE ("token"), CONSTRAINT "UQ_285a1db5e4658633d9938b7a8e7" UNIQUE ("device_id"), CONSTRAINT "PK_cdd834aa4f6dc2efd7df5041233" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "push_token" ADD CONSTRAINT "FK_d877a5d2f20730f3a3c3b505e7d" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "push_token" DROP CONSTRAINT "FK_d877a5d2f20730f3a3c3b505e7d"`);
        await queryRunner.query(`DROP TABLE "push_token"`);
    }

}
