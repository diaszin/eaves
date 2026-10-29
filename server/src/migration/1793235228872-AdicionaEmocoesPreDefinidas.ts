import { MigrationInterface, QueryRunner } from 'typeorm';

export class AdicionaEmocoesPreDefinidas1793235228872 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        INSERT INTO "emotions" ("emotion")
        VALUES
            ('medo'),
            ('raiva'),
            ('felicidade'),
            ('tristeza'),
            ('nojo'),
            ('surpresa')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DELETE FROM "emotions"
        WHERE "emotion" IN (
            'medo',
            'raiva',
            'felicidade',
            'tristeza',
            'nojo',
            'surpresa'
        )
    `);
  }
}
