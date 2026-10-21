import { Injectable } from '@nestjs/common';
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
    ) { }

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

    async answerPHQDailyQuestions(
        dto: AnswerDailyPHQSurveyRequest[],
        user: User,
    ) {
        const answeredSurvey = dto.map((element) => {
            return {
                question: {
                    id: element.questionId,
                },
                answer: {
                    id: element.answerId,
                },
                answeredBy: user,
                type: "PHQ"
            } as Partial<Survey>;
        });


        const survey = this.surveyRepository.create(answeredSurvey)

        await this.surveyRepository.insert(survey);
    }


    async doesUserNeedToAnswerPHQ9(
        dto: AnswerDailyPHQSurveyRequest[],
    ): Promise<boolean> {
        const answerIds = dto.map((element) => element.answerId);

        if (answerIds.length === 0) {
            return false;
        }

        const answersDbPromisses = []

        for (const question of dto) {
            answersDbPromisses.push(this.answerRepository.findOneBy({ id: question.answerId }))
        }

        const totalScore = (await Promise.all(answersDbPromisses)).reduce((prev, current) => prev + (current?.score || 0) , 0)


        
        return totalScore >= 3
    }
}
