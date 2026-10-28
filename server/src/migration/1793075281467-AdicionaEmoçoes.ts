import { MigrationInterface, QueryRunner } from "typeorm";

export class AdicionaEmoçoes1793075281467 implements MigrationInterface {
    name = "AdicionaEmoçoes1793075281467";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO "Emotions" ("emotion")
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
            DELETE FROM "Emotions"
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
