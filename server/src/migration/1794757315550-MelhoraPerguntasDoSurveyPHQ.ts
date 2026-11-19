import { MigrationInterface, QueryRunner } from 'typeorm';

export class MelhoraPerguntasDoSurveyPHQ1794757315550 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "questions"
      SET "content" = CASE "content"
        WHEN 'Pouco interesse ou pouco prazer em fazer as coisas' THEN 'Teve pouco interesse ou sentiu pouco prazer em realizar suas atividades?'
        WHEN 'Se sentir para baixo, deprimido/a ou sem perspectiva' THEN 'Sentiu-se triste, deprimido(a) ou sem esperança em relação ao futuro?'
        WHEN 'Dificuldade para pegar no sono ou permanecer dormindo, ou dormir mais do que de costume' THEN 'Teve dificuldade para adormecer, permanecer dormindo ou dormiu mais do que o habitual?'
        WHEN 'Se sentir cansado/a ou com pouca energia' THEN 'Sentiu-se cansado(a) ou com pouca energia para realizar suas atividades?'
        WHEN 'Falta de apetite ou comendo demais' THEN 'Teve pouco apetite ou comeu mais do que o habitual?'
        WHEN 'Se sentir mal consigo mesmo/a — ou achar que você é um fracasso ou que decepcionou sua família ou você mesmo/a' THEN 'Sentiu-se mal consigo mesmo(a), como se fosse um fracasso ou tivesse decepcionado a si mesmo(a) ou sua família?'
        WHEN 'Dificuldade para se concentrar nas coisas, como ler o jornal ou ver televisão' THEN 'Teve dificuldade para se concentrar em atividades, como ler ou assistir televisão?'
        WHEN 'Lentidão para se movimentar ou falar, a ponto de outras pessoas perceberem? Ou o oposto — estar tão agitado/a ou irrequieto/a que você fica andando de um lado para o outro muito mais do que de costume' THEN 'Percebeu que estava se movimentando ou falando mais lentamente do que o habitual, a ponto de outras pessoas notarem? Ou, pelo contrário, sentiu-se tão agitado(a) ou inquieto(a) que teve dificuldade para ficar parado(a)?'
        WHEN 'Pensar em se ferir de alguma maneira ou que seria melhor estar morto/a' THEN 'Teve pensamentos de se machucar de alguma forma ou de que seria melhor estar morto(a)?'
        ELSE "content"
      END
      WHERE "category" = 'PHQ'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "questions"
      SET "content" = CASE "content"
        WHEN 'Teve pouco interesse ou sentiu pouco prazer em realizar suas atividades?' THEN 'Pouco interesse ou pouco prazer em fazer as coisas'
        WHEN 'Sentiu-se triste, deprimido(a) ou sem esperança em relação ao futuro?' THEN 'Se sentir para baixo, deprimido/a ou sem perspectiva'
        WHEN 'Teve dificuldade para adormecer, permanecer dormindo ou dormiu mais do que o habitual?' THEN 'Dificuldade para pegar no sono ou permanecer dormindo, ou dormir mais do que de costume'
        WHEN 'Sentiu-se cansado(a) ou com pouca energia para realizar suas atividades?' THEN 'Se sentir cansado/a ou com pouca energia'
        WHEN 'Teve pouco apetite ou comeu mais do que o habitual?' THEN 'Falta de apetite ou comendo demais'
        WHEN 'Sentiu-se mal consigo mesmo(a), como se fosse um fracasso ou tivesse decepcionado a si mesmo(a) ou sua família?' THEN 'Se sentir mal consigo mesmo/a — ou achar que você é um fracasso ou que decepcionou sua família ou você mesmo/a'
        WHEN 'Teve dificuldade para se concentrar em atividades, como ler ou assistir televisão?' THEN 'Dificuldade para se concentrar nas coisas, como ler o jornal ou ver televisão'
        WHEN 'Percebeu que estava se movimentando ou falando mais lentamente do que o habitual, a ponto de outras pessoas notarem? Ou, pelo contrário, sentiu-se tão agitado(a) ou inquieto(a) que teve dificuldade para ficar parado(a)?' THEN 'Lentidão para se movimentar ou falar, a ponto de outras pessoas perceberem? Ou o oposto — estar tão agitado/a ou irrequieto/a que você fica andando de um lado para o outro muito mais do que de costume'
        WHEN 'Teve pensamentos de se machucar de alguma forma ou de que seria melhor estar morto(a)?' THEN 'Pensar em se ferir de alguma maneira ou que seria melhor estar morto/a'
        ELSE "content"
      END
      WHERE "category" = 'PHQ'
    `);
  }
}
