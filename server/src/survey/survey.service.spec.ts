import { describe, expect, it, vi } from 'vitest';
import { SurveyService } from './survey.service.js';

function record(id: number, questionId: number, score: number, date: string) {
  return {
    id,
    type: 'PHQ',
    answeredDate: new Date(date),
    question: { id: questionId, content: `Pergunta ${questionId}` },
    answer: { id: id * 10, score },
    answeredBy: {
      id: 7,
      email: 'paciente@example.com',
      profile: { fullname: 'Paciente Teste' },
    },
  };
}

function setup(records: ReturnType<typeof record>[]) {
  const surveyRepository = { find: vi.fn().mockResolvedValue(records) };
  const questionRepository = {
    find: vi.fn().mockResolvedValue([{ id: 1 }, { id: 2 }]),
  };
  const service = new SurveyService(
    surveyRepository as never,
    questionRepository as never,
    {} as never,
  );
  return { service };
}

describe('SurveyService.getAnsweredPHQ9Surveys', () => {
  it('inclui a categoria PHQ em cada resposta', async () => {
    const { service } = setup([
      record(1, 1, 2, '2026-11-10T12:00:00Z'),
      record(2, 2, 1, '2026-11-10T12:01:00Z'),
    ]);

    const result = await service.getAnsweredPHQ9Surveys();

    expect(result).toHaveLength(1);
    expect(result[0].category).toBe('PHQ');
  });

  it('agrupa registros do mesmo paciente no mesmo dia somando a pontuação', async () => {
    const { service } = setup([
      record(1, 1, 2, '2026-11-10T12:00:00Z'),
      record(2, 2, 1, '2026-11-10T12:01:00Z'),
      record(3, 1, 3, '2026-11-11T12:00:00Z'),
    ]);

    const result = await service.getAnsweredPHQ9Surveys();

    expect(result).toHaveLength(2);
    expect(result[0].totalScore).toBe(3);
    expect(result[0].answers).toHaveLength(2);
    expect(result[1].totalScore).toBe(3);
    expect(result.every((r) => r.category === 'PHQ')).toBe(true);
  });
});
