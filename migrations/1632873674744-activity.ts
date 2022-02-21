import {MigrationInterface, QueryRunner} from "typeorm";

export class activity1632873674744 implements MigrationInterface {
    name = 'activity1632873674744'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "activity" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "type_action" character varying NOT NULL, "procedure_action" character varying NOT NULL, "source_user_id" integer NOT NULL, "target_user_id" integer NOT NULL, CONSTRAINT "PK_a0a932d379194efe3f02512246d" PRIMARY KEY ("id", "source_user_id", "target_user_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_eeb6e0f8cb4b253a270ce28c9c" ON "activity" ("source_user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_e398dc04d665adec52e13e0863" ON "activity" ("target_user_id") `);
        await queryRunner.query(`ALTER TABLE "activity" ADD CONSTRAINT "FK_eeb6e0f8cb4b253a270ce28c9cf" FOREIGN KEY ("source_user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "activity" ADD CONSTRAINT "FK_e398dc04d665adec52e13e08632" FOREIGN KEY ("target_user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "activity" DROP CONSTRAINT "FK_e398dc04d665adec52e13e08632"`);
        await queryRunner.query(`ALTER TABLE "activity" DROP CONSTRAINT "FK_eeb6e0f8cb4b253a270ce28c9cf"`);
        await queryRunner.query(`DROP INDEX "IDX_e398dc04d665adec52e13e0863"`);
        await queryRunner.query(`DROP INDEX "IDX_eeb6e0f8cb4b253a270ce28c9c"`);
        await queryRunner.query(`DROP TABLE "activity"`);
    }

}
