import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Survey } from './entities/survey.entity.js';
import { Repository } from 'typeorm';

@Injectable()
export class SurveyService {
    constructor(@InjectRepository(Survey) private readonly surveyRepository: Repository<Survey>) { }

    async getPHQ9Survey(){
        
    }

}
