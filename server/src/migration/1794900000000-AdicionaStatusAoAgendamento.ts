import { MigrationInterface, QueryRunner } from 'typeorm';

export class AdicionaStatusAoAgendamento1794900000000 implements MigrationInterface {
  name = 'AdicionaStatusAoAgendamento1794900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."appointment_status_enum" AS ENUM('scheduled', 'cancelled')`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointment" ADD "status" "public"."appointment_status_enum" NOT NULL DEFAULT 'scheduled'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "appointment" DROP COLUMN "status"`);
    await queryRunner.query(`DROP TYPE "public"."appointment_status_enum"`);
  }
}
