import { MigrationInterface, QueryRunner } from "typeorm";

export class CriaPrimeiraEntidade1792276897996 implements MigrationInterface {
    name = 'CriaPrimeiraEntidade1792276897996'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "profile" ("id" SERIAL NOT NULL, "fullname" text NOT NULL, "document" character(11) NOT NULL, "race" text NOT NULL, "incomeBraket" text NOT NULL, "emergencyPhone" text NOT NULL, "cep" text NOT NULL, "birthday" TIMESTAMP(3) NOT NULL, CONSTRAINT "PK_3dd8bfc97e4a77c70971591bdcb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."User_role_enum" AS ENUM('patient', 'lobby', 'trainee', 'professor', 'coordinator')`);
        await queryRunner.query(`CREATE TABLE "User" ("id" SERIAL NOT NULL, "email" text NOT NULL, "password" text NOT NULL, "role" "public"."User_role_enum" NOT NULL DEFAULT 'patient', "profileId" integer NOT NULL, CONSTRAINT "REL_654d8b4ea5b99b309ea9d8498a" UNIQUE ("profileId"), CONSTRAINT "PK_9862f679340fb2388436a5ab3e4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "User_email_key" ON "User"  ("email") `);
        await queryRunner.query(`CREATE TABLE "appointment" ("id" SERIAL NOT NULL, "initialDate" TIMESTAMP WITH TIME ZONE NOT NULL, "endDate" TIMESTAMP WITH TIME ZONE NOT NULL, "created" TIMESTAMP NOT NULL DEFAULT now(), "createdById" integer NOT NULL, "patientId" integer NOT NULL, CONSTRAINT "PK_e8be1a53027415e709ce8a2db74" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "User" ADD CONSTRAINT "FK_654d8b4ea5b99b309ea9d8498a9" FOREIGN KEY ("profileId") REFERENCES "profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD CONSTRAINT "FK_6fd8c4e7663d561d0679412e310" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD CONSTRAINT "FK_5ce4c3130796367c93cd817948e" FOREIGN KEY ("patientId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointment" DROP CONSTRAINT "FK_5ce4c3130796367c93cd817948e"`);
        await queryRunner.query(`ALTER TABLE "appointment" DROP CONSTRAINT "FK_6fd8c4e7663d561d0679412e310"`);
        await queryRunner.query(`ALTER TABLE "User" DROP CONSTRAINT "FK_654d8b4ea5b99b309ea9d8498a9"`);
        await queryRunner.query(`DROP TABLE "appointment"`);
        await queryRunner.query(`DROP INDEX "public"."User_email_key"`);
        await queryRunner.query(`DROP TABLE "User"`);
        await queryRunner.query(`DROP TYPE "public"."User_role_enum"`);
        await queryRunner.query(`DROP TABLE "profile"`);
    }

}
