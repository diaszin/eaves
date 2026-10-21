import { MigrationInterface, QueryRunner } from "typeorm";

export class AdicionaPHQ91792541235096 implements MigrationInterface {
    name = "AdicionaPHQ91792541235096";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "answers" (
                "id" SERIAL NOT NULL,
                "content" text NOT NULL,
                "score" integer NOT NULL,
                "category" text NOT NULL,
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "createdDate" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_answers" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "questions" (
                "id" SERIAL NOT NULL,
                "content" text NOT NULL,
                "category" text NOT NULL,
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "createdDate" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_questions" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            INSERT INTO "answers" ("content", "score", "category")
            VALUES
                ('Nenhuma vez', 0, 'PHQ'),
                ('Vários dias', 1, 'PHQ'),
                ('Mais da metade dos dias', 2, 'PHQ'),
                ('Quase todos os dias', 3, 'PHQ')
        `);
        await queryRunner.query(`
            INSERT INTO "questions" ("content", "category")
            VALUES
                ('Pouco interesse ou pouco prazer em fazer as coisas', 'PHQ'),
                ('Se sentir para baixo, deprimido/a ou sem perspectiva', 'PHQ'),
                ('Dificuldade para pegar no sono ou permanecer dormindo, ou dormir mais do que de costume', 'PHQ'),
                ('Se sentir cansado/a ou com pouca energia', 'PHQ'),
                ('Falta de apetite ou comendo demais', 'PHQ'),
                ('Se sentir mal consigo mesmo/a — ou achar que você é um fracasso ou que decepcionou sua família ou você mesmo/a', 'PHQ'),
                ('Dificuldade para se concentrar nas coisas, como ler o jornal ou ver televisão', 'PHQ'),
                ('Lentidão para se movimentar ou falar, a ponto de outras pessoas perceberem? Ou o oposto — estar tão agitado/a ou irrequieto/a que você fica andando de um lado para o outro muito mais do que de costume', 'PHQ'),
                ('Pensar em se ferir de alguma maneira ou que seria melhor estar morto/a', 'PHQ')
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DROP TABLE "questions"');
        await queryRunner.query('DROP TABLE "answers"');
    }

}
