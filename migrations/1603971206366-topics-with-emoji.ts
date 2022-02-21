import { MigrationInterface, QueryRunner } from 'typeorm';

export class topicsWithEmoji1603971206366 implements MigrationInterface {
  name = 'topicsWithEmoji1603971206366';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('TRUNCATE TABLE "topic" RESTART IDENTITY CASCADE');
    await queryRunner.query(
      `ALTER TABLE "topic" ADD "icon" character varying NOT NULL`,
    );

    const topics = [
      ['Art & Cinema', '🎭'],
      ['Architecture & Design', '🎨'],
      ['Animals & Nature', '🐶'],
      ['Books & Authors', '📖'],
      ['Business & Startups', '🚀'],
      ['Climate & Ecology', '🌋'],
      ['DIY & Crafts', '🛠'],
      ['Education & Learning', '🎓'],
      ['Entertainment & Humor', '🤣'],
      ['Fitness', '💪'],
      ['Food & Cooking', '🍳'],
      ['Gaming', '🎮'],
      ['Health & Wellness', '💊'],
      ['Lifestyle & Fashion', '👗'],
      ['Music', '🎧'],
      ['News & Media', '🗞'],
      ['Parenting & Family', '👧'],
      ['Photo & Video', '📷'],
      ['Politics', '💼'],
      ['Prosperity', '💸'],
      ['Science & Tech', '🔬'],
      ['Sex & Relationships', '😘'],
      ['Shopping', '🛍'],
      ['Spirituality & Religion', '🙏'],
      ['Sports', '⚽️'],
      ['Travel', '🌍'],
    ].map(([topic, icon]) => `'${topic}', '${icon}'`);

    await queryRunner.query(`
      INSERT INTO topic (name, icon) VALUES (${topics.join('),(')})
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "topic" DROP COLUMN "icon"`);
    await queryRunner.query('TRUNCATE TABLE "topic" RESTART IDENTITY CASCADE');

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
}
