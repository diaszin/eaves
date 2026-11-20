import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Survey } from './entities/survey.entity.js';
import { Repository } from 'typeorm';
import { Question } from './entities/questions.entity.js';
import { Answers } from './entities/answers.entity.js';
import { AnswerDailyPHQSurveyRequest } from './dto/survey.dto.js';
import { User } from '../auth/entities/user.entity.js';

@Injectable()
export class SurveyService {
  constructor(
    @InjectRepository(Survey)
    private readonly surveyRepository: Repository<Survey>,
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    @InjectRepository(Answers)
    private readonly answerRepository: Repository<Answers>,
  ) {}

  async getPHQ9Survey() {
    const answers = await this.answerRepository.find({
      where: {
        category: 'PHQ',
      },
      select: {
        content: true,
        score: true,
        id: true,
      },
    });

    const questions = await this.questionRepository.findBy({
      category: 'PHQ',
    });

    return questions.map((element) => {
      return {
        id: element.id,
        title: element.content,
        answers: answers,
      };
    });
  }

  async getAnsweredPHQ9Surveys() {
    const records = await this.surveyRepository.find({
      where: { type: 'PHQ' },
      relations: {
        question: true,
        answer: true,
        answeredBy: { profile: true },
      },
      order: { answeredDate: 'DESC', id: 'ASC' },
    });

    return this.toPHQ9Responses(records);
  }

  async getAnsweredPHQ9Survey(id: number) {
    const record = await this.surveyRepository.findOne({
      where: { id, type: 'PHQ' },
      relations: { answeredBy: true },
    });

    if (!record) {
      throw new NotFoundException('Questionário não encontrado');
    }

    const records = await this.surveyRepository
      .createQueryBuilder('survey')
      .leftJoinAndSelect('survey.question', 'question')
      .leftJoinAndSelect('survey.answer', 'answer')
      .innerJoinAndSelect('survey.answeredBy', 'patient')
      .leftJoinAndSelect('patient.profile', 'profile')
      .where('survey.type = :type', { type: 'PHQ' })
      .andWhere('patient.id = :patientId', {
        patientId: record.answeredBy.id,
      })
      .andWhere(
        'CAST(survey."answeredDate" AS DATE) = CAST(:answeredDate AS DATE)',
        { answeredDate: record.answeredDate },
      )
      .orderBy('survey.answeredDate', 'ASC')
      .addOrderBy('survey.id', 'ASC')
      .getMany();

    const response = (await this.toPHQ9Responses(records)).find(
      (survey) => survey.id === id,
    );
    if (!response) {
      throw new NotFoundException('Questionário não encontrado');
    }

    return response;
  }

  private async toPHQ9Responses(records: Survey[]) {
    const questions = await this.questionRepository.find({
      where: { category: 'PHQ' },
      order: { id: 'ASC' },
    });
    const questionIndexes = new Map(
      questions.map((question, index) => [question.id, index]),
    );
    const grouped = new Map<string, Survey[]>();

    for (const record of records) {
      const date = record.answeredDate.toLocaleDateString('pt-BR', {
        timeZone: 'America/Bahia',
      });
      const key = `${record.answeredBy.id}:${date}`;
      const answers = grouped.get(key) ?? [];
      answers.push(record);
      grouped.set(key, answers);
    }

    return Array.from(grouped.values(), (answers) => {
      const firstAnswer = answers[0];
      const totalScore = answers.reduce(
        (total, answer) => total + answer.answer.score,
        0,
      );

      return {
        id: firstAnswer.id,
        createdAt: firstAnswer.answeredDate,
        category: firstAnswer.type,
        totalScore,
        severity:
          totalScore <= 4
            ? 'minimal'
            : totalScore <= 9
              ? 'mild'
              : totalScore <= 14
                ? 'moderate'
                : totalScore <= 19
                  ? 'moderately_severe'
                  : 'severe',
        answers: answers
          .map((answer) => ({
            questionIndex: questionIndexes.get(answer.question.id) ?? -1,
            question: answer.question.content,
            score: answer.answer.score,
          }))
          .filter((answer) => answer.questionIndex >= 0)
          .sort((left, right) => left.questionIndex - right.questionIndex),
        patient: {
          id: firstAnswer.answeredBy.id,
          email: firstAnswer.answeredBy.email,
          profile: {
            fullname: firstAnswer.answeredBy.profile.fullname,
          },
        },
      };
    });
  }

  async answerPHQDailyQuestions(
    dto: AnswerDailyPHQSurveyRequest[],
    user: User,
  ) {
    const userHasAnswered = await this.hasUserAnsweredDailyPHQ9Survey(user);
    if (userHasAnswered) {
      throw new NotFoundException('O usuário já respondeu a pesquisa diária');
    }

    const answeredSurvey = dto.map((element) => {
      return {
        question: {
          id: element.questionId,
        },
        answer: {
          id: element.answerId,
        },
        answeredBy: user,
        type: 'PHQ',
      } as Partial<Survey>;
    });

    const survey = this.surveyRepository.create(answeredSurvey);

    await this.surveyRepository.insert(survey);
  }

  async doesUserNeedToAnswerPHQ9(
    dto: AnswerDailyPHQSurveyRequest[],
  ): Promise<boolean> {
    const answerIds = dto.map((element) => element.answerId);

    if (answerIds.length === 0) {
      return false;
    }

    const answersDbPromisses = [];

    for (const question of dto) {
      answersDbPromisses.push(
        this.answerRepository.findOneBy({ id: question.answerId }),
      );
    }

    const totalScore = (await Promise.all(answersDbPromisses)).reduce(
      (prev, current) => prev + (current?.score || 0),
      0,
    );

    return totalScore >= 3;
  }

  async hasUserAnsweredDailyPHQ9Survey(user: User): Promise<boolean> {
    const startOfDay = new Date(Date.now());

    const count = await this.surveyRepository
      .createQueryBuilder('survey')
      .innerJoin('survey.answeredBy', 'user')
      .where('user.id = :userId', { userId: user.id })
      .andWhere('survey.type = :type', { type: 'PHQ' })
      .andWhere('CAST(survey."answeredDate" AS DATE) = CAST(:startOfDay AS DATE)', { startOfDay })
      .getCount();

    return count > 0;
  }
}
