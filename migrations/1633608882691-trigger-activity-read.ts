import { MigrationInterface, QueryRunner } from 'typeorm';

export class triggerActivityRead1633608882691 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE OR REPLACE FUNCTION insert_activity() RETURNS TRIGGER AS $insert$
        DECLARE BEGIN
            INSERT INTO activity_read(id_user,id_activity) VALUES (NEW.target_user_id,NEW.id);
            RETURN NULL;
        END;
        $insert$ LANGUAGE plpgsql;`);
    await queryRunner.query(`CREATE TRIGGER IN_acitivity_read AFTER INSERT ON activity FOR EACH ROW EXECUTE PROCEDURE insert_activity();`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TRIGGER IN_acitivity_read ON activity;`);
    await queryRunner.query(`DROP  FUNCTION insert_activity;`);
  }
}
