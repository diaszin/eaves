import { Module } from '@nestjs/common';
import { SurveyService } from './survey.service.js';
import { SurveyController } from './survey.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Survey } from './entities/survey.entity.js';
import { Question } from './entities/questions.entity.js';
import { Answers } from './entities/answers.entity.js';
import { SurveyPolicy } from './survey.policy.js';

@Module({
  imports: [TypeOrmModule.forFeature([Survey, Question, Answers])],
  controllers: [SurveyController],
  providers: [SurveyService, SurveyPolicy],
})
export class SurveyModule { }
