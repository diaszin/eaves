import { MigrationInterface, QueryRunner } from 'typeorm';

export class CriaEscalasEHorariosCustomizados1793300000000
  implements MigrationInterface
{
  name = 'CriaEscalasEHorariosCustomizados1793300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "schedule" (
        "id" SERIAL NOT NULL,
        "title" character varying(150) NOT NULL,
        "description" text,
        "startDate" date NOT NULL,
        "endDate" date,
        "isActive" boolean NOT NULL DEFAULT true,
        "userId" integer NOT NULL,
        "createdById" integer NOT NULL,
        "created" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_schedule_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "schedule_shift" (
        "id" SERIAL NOT NULL,
        "scheduleId" integer NOT NULL,
        "dayOfWeek" smallint,
        "customDate" date,
        "startTime" character varying(5) NOT NULL,
        "endTime" character varying(5) NOT NULL,
        "location" character varying(120),
        "notes" text,
        "maxCapacity" integer NOT NULL DEFAULT 1,
        CONSTRAINT "PK_schedule_shift_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "schedule"
      ADD CONSTRAINT "FK_schedule_user"
      FOREIGN KEY ("userId") REFERENCES "User"("id")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "schedule"
      ADD CONSTRAINT "FK_schedule_created_by"
      FOREIGN KEY ("createdById") REFERENCES "User"("id")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "schedule_shift"
      ADD CONSTRAINT "FK_schedule_shift_schedule"
      FOREIGN KEY ("scheduleId") REFERENCES "schedule"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "schedule_shift" DROP CONSTRAINT "FK_schedule_shift_schedule"
    `);
    await queryRunner.query(`
      ALTER TABLE "schedule" DROP CONSTRAINT "FK_schedule_created_by"
    `);
    await queryRunner.query(`
      ALTER TABLE "schedule" DROP CONSTRAINT "FK_schedule_user"
    `);
    await queryRunner.query(`DROP TABLE "schedule_shift"`);
    await queryRunner.query(`DROP TABLE "schedule"`);
  }
}
