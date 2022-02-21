import {MigrationInterface, QueryRunner} from "typeorm";

export class teamMembers1636366241701 implements MigrationInterface {
    name = 'teamMembers1636366241701'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "team_member" ("id" SERIAL NOT NULL, "isAccepted" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "team_id" integer NOT NULL, "userId" integer NOT NULL, CONSTRAINT "PK_649680684d72a20d279641469c5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "team_member" ADD CONSTRAINT "FK_a1b5b4f5fa1b7f890d0a278748b" FOREIGN KEY ("team_id") REFERENCES "team"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "team_member" ADD CONSTRAINT "FK_d2be3e8fc9ab0f69673721c7fc3" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "team_member" DROP CONSTRAINT "FK_d2be3e8fc9ab0f69673721c7fc3"`);
        await queryRunner.query(`ALTER TABLE "team_member" DROP CONSTRAINT "FK_a1b5b4f5fa1b7f890d0a278748b"`);
        await queryRunner.query(`DROP TABLE "team_member"`);
    }

}
