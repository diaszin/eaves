import { MigrationInterface, QueryRunner } from "typeorm";

export class AdicionaProfissionalResponsavelPelaSessao1794280630277 implements MigrationInterface {
    name = 'AdicionaProfissionalResponsavelPelaSessao1794280630277'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "schedule_shift" DROP CONSTRAINT "FK_schedule_shift_schedule"`);
        await queryRunner.query(`ALTER TABLE "schedule" DROP CONSTRAINT "FK_schedule_user"`);
        await queryRunner.query(`ALTER TABLE "schedule" DROP CONSTRAINT "FK_schedule_created_by"`);
        await queryRunner.query(`ALTER TABLE "general_settings" DROP CONSTRAINT "CHK_general_settings_singleton"`);
        await queryRunner.query(`ALTER TABLE "general_settings" DROP CONSTRAINT "CHK_general_settings_therapy_duration"`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD "professionalId" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD CONSTRAINT "FK_1efb8063ad19e9e3f9157219033" FOREIGN KEY ("professionalId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "schedule_shift" ADD CONSTRAINT "FK_d81b4b53fa3f674fba486d97781" FOREIGN KEY ("scheduleId") REFERENCES "schedule"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "schedule" ADD CONSTRAINT "FK_d796103491cf0bae197dda59477" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "schedule" ADD CONSTRAINT "FK_9c94e97526c0fc1a4d4a45af773" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "schedule" DROP CONSTRAINT "FK_9c94e97526c0fc1a4d4a45af773"`);
        await queryRunner.query(`ALTER TABLE "schedule" DROP CONSTRAINT "FK_d796103491cf0bae197dda59477"`);
        await queryRunner.query(`ALTER TABLE "schedule_shift" DROP CONSTRAINT "FK_d81b4b53fa3f674fba486d97781"`);
        await queryRunner.query(`ALTER TABLE "appointment" DROP CONSTRAINT "FK_1efb8063ad19e9e3f9157219033"`);
        await queryRunner.query(`ALTER TABLE "appointment" DROP COLUMN "professionalId"`);
        await queryRunner.query(`ALTER TABLE "general_settings" ADD CONSTRAINT "CHK_general_settings_therapy_duration" CHECK ((("therapySessionDurationMinutes" >= 1) AND ("therapySessionDurationMinutes" <= 1440)))`);
        await queryRunner.query(`ALTER TABLE "general_settings" ADD CONSTRAINT "CHK_general_settings_singleton" CHECK ((id = 1))`);
        await queryRunner.query(`ALTER TABLE "schedule" ADD CONSTRAINT "FK_schedule_created_by" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "schedule" ADD CONSTRAINT "FK_schedule_user" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "schedule_shift" ADD CONSTRAINT "FK_schedule_shift_schedule" FOREIGN KEY ("scheduleId") REFERENCES "schedule"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
