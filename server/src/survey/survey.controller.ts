import { Controller } from '@nestjs/common';
import { SurveyService } from './survey.service.js';

@Controller('survey')
export class SurveyController {
  constructor(private readonly surveyService: SurveyService) {}
}
