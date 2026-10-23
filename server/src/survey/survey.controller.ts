import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  QueryMethod,
} from '@nestjs/common';
import { SurveyService } from './survey.service.js';
import { AnswerDailyPHQSurveyRequest } from './dto/survey.dto.js';
import { CurrentUser } from '@nestjs/authentication';
import { User } from '../auth/entities/user.entity.js';

@Controller('survey')
export class SurveyController {
  constructor(private readonly surveyService: SurveyService) {}

  @Get('/phq')
  getPHQSurvey() {
    return this.surveyService.getPHQ9Survey();
  }

  @Post('/phq/daily/answer')
  answerPhqDaily(
    @Body() dto: AnswerDailyPHQSurveyRequest[],
    @CurrentUser() user: User,
  ) {
    return this.surveyService.answerPHQDailyQuestions(dto, user);
  }

  @QueryMethod('/phq/phq9/verify')
  async checkNextPHQLevelAccess(@Body() dto: AnswerDailyPHQSurveyRequest[]) {
    if (!Array.isArray(dto) || dto.length !== 2) {
      throw new BadRequestException(
        'A validação deve ocorrer somente para o PHQ-2',
      );
    }

    const doesPhq = await this.surveyService.doesUserNeedToAnswerPHQ9(dto);

    return {
      does: doesPhq,
    };
  }

  @Get('phq/daily/verify')
  async verifyIfUSerHasAnsweredPHQSurvey(@CurrentUser() user: User) {
    const isAnswered =
      await this.surveyService.hasUserAnsweredDailyPHQ9Survey(user);

    return {
      answered: isAnswered,
    };
  }
}
