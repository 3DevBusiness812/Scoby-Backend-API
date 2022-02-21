import { MigrationInterface, QueryRunner } from 'typeorm';
import { RegistrationStatusEnum } from '../src/users/registration-status.entity';

export class user1596628111857 implements MigrationInterface {
  name = 'user1596628111857';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "registration_status" ("id" integer NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_3691b9e7eff57b9b5a98ac65b04" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("id" SERIAL NOT NULL, "phone" character varying NOT NULL, "username" character varying, "password" character varying, "birthday" TIMESTAMP, "verification_code" character varying, "verification_expire" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "registration_status_id" integer NOT NULL, CONSTRAINT "UQ_8e1f623798118e629b46a9e6299" UNIQUE ("phone"), CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_cbdae50b6ad2a8ff7e73db4f08e" FOREIGN KEY ("registration_status_id") REFERENCES "registration_status"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    const registrationStatusValues = [
      RegistrationStatusEnum.CREATED,
      RegistrationStatusEnum.VERIFIED,
      RegistrationStatusEnum.COMPLETED,
    ].map(id => [id, `'${RegistrationStatusEnum[id]}'`]);

    await queryRunner.query(
      `INSERT INTO registration_status (id, name) VALUES (${registrationStatusValues.join(
        '),(',
      )})`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_cbdae50b6ad2a8ff7e73db4f08e"`,
    );
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "registration_status"`);
  }
}
