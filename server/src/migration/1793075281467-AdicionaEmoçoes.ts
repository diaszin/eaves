import { MigrationInterface, QueryRunner } from "typeorm";

export class AdicionaEmoçoes1793075281467 implements MigrationInterface {
    name = "AdicionaEmoçoes1793075281467";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO "Emotions" ("emotion")
            VALUES
                ('fear'),
                ('angry'),
                ('happy'),
                ('sad'),
                ('pish'),
                ('surprise')
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM "Emotions"
            WHERE "emotion" IN (
                'fear',
                'angry',
                'happy',
                'sad',
                'pish',
                'surprise'
            )
        `);
    }

}
