import {MigrationInterface, QueryRunner} from "typeorm";

export class userTopic1597944080950 implements MigrationInterface {
    name = 'userTopic1597944080950'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "topic_id" integer`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_73f13c58a72b763e49c5c4c8c45" FOREIGN KEY ("topic_id") REFERENCES "topic"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_73f13c58a72b763e49c5c4c8c45"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "topic_id"`);
    }

}
