import { MigrationInterface, QueryRunner } from 'typeorm';

export class topics1597849058641 implements MigrationInterface {
  name = 'topics1597849058641';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "topic" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_33aa4ecb4e4f20aa0157ea7ef61" PRIMARY KEY ("id"))`,
    );

    const topics = [
      'Art',
      'Beauty & Fashion',
      'Brand',
      'Books & Writing',
      'Comedy',
      'Consultant & Service',
      'Education',
      'Entertainment',
      'Food & Cooking',
      'Health Care',
      'Gaming',
      'Government & Politics',
      'IT & High Tech',
      'Media',
      'Music',
      'News & Politics',
      'Personal Blog',
      'Pets & Animals',
      'Photo & Video',
      'Public Figure',
      'Shopping & Retail',
      'Sports & Fitness',
      'Travel & Resort',
      'Well-being',
      'Other',
    ].map((topic) => `'${topic}'`);

    await queryRunner.query(`
      INSERT INTO topic (name) VALUES (${topics.join('),(')})
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "topic"`);
  }
}
