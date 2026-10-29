import { MigrationInterface, QueryRunner } from "typeorm";

export class ImplementaDiarioDoPaciente1793234883759 implements MigrationInterface {
    name = 'ImplementaDiarioDoPaciente1793234883759'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "emotions" ("id" SERIAL NOT NULL, "emotion" text NOT NULL, CONSTRAINT "PK_0cfeb943349b02abbe434bf6980" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "personal_journal" ("id" SERIAL NOT NULL, "content" text NOT NULL, "createdDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "emotionId" integer NOT NULL, "createdById" integer NOT NULL, CONSTRAINT "PK_be2ab420f988005d46a769053d2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "survey" ("id" SERIAL NOT NULL, "type" text NOT NULL, "answeredDate" TIMESTAMP NOT NULL DEFAULT now(), "questionId" integer NOT NULL, "answerId" integer NOT NULL, "answeredById" integer NOT NULL, CONSTRAINT "PK_f0da32b9181e9c02ecf0be11ed3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "personal_journal" ADD CONSTRAINT "FK_bf26e3e325ea813d339eec9e141" FOREIGN KEY ("emotionId") REFERENCES "emotions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "personal_journal" ADD CONSTRAINT "FK_fc8e63e1675c5cc0a408642f6c1" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "survey" ADD CONSTRAINT "FK_4974c12f7570f2d1f11f460eee6" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "survey" ADD CONSTRAINT "FK_fabf6f7b489468d566c80a53b10" FOREIGN KEY ("answerId") REFERENCES "answers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "survey" ADD CONSTRAINT "FK_d3f0bd89108118c595be2aa416d" FOREIGN KEY ("answeredById") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "survey" DROP CONSTRAINT "FK_d3f0bd89108118c595be2aa416d"`);
        await queryRunner.query(`ALTER TABLE "survey" DROP CONSTRAINT "FK_fabf6f7b489468d566c80a53b10"`);
        await queryRunner.query(`ALTER TABLE "survey" DROP CONSTRAINT "FK_4974c12f7570f2d1f11f460eee6"`);
        await queryRunner.query(`ALTER TABLE "personal_journal" DROP CONSTRAINT "FK_fc8e63e1675c5cc0a408642f6c1"`);
        await queryRunner.query(`ALTER TABLE "personal_journal" DROP CONSTRAINT "FK_bf26e3e325ea813d339eec9e141"`);
        await queryRunner.query(`DROP TABLE "survey"`);
        await queryRunner.query(`DROP TABLE "personal_journal"`);
        await queryRunner.query(`DROP TABLE "emotions"`);
    }

}
