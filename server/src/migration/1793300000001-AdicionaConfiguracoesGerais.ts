import { MigrationInterface, QueryRunner } from 'typeorm';

export class AdicionaConfiguracoesGerais1793300000001
  implements MigrationInterface
{
  name = 'AdicionaConfiguracoesGerais1793300000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "appointment" ADD "notes" text
    `);
    await queryRunner.query(`
      CREATE TABLE "general_settings" (
        "id" smallint NOT NULL DEFAULT 1,
        "therapySessionDurationMinutes" integer NOT NULL DEFAULT 50,
        CONSTRAINT "PK_general_settings" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_general_settings_singleton" CHECK ("id" = 1),
        CONSTRAINT "CHK_general_settings_therapy_duration"
          CHECK ("therapySessionDurationMinutes" BETWEEN 1 AND 1440)
      )
    `);
    await queryRunner.query(`
      INSERT INTO "general_settings" ("id", "therapySessionDurationMinutes")
      VALUES (1, 50)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "general_settings"`);
    await queryRunner.query(`ALTER TABLE "appointment" DROP COLUMN "notes"`);
  }
}
