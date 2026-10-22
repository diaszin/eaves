import { AxiosInstance } from "axios";
import { surveyClient } from "./surveys.client";
import {
  AnswerPHQSurveyData,
  DoesPHQ9QuestionReponse,
  SurveyQuestionReponse,
} from "./survey.type";

class SurveyService {
  private client: AxiosInstance = surveyClient;

  async getQuestions() {
    const response = await this.client.get("/phq");

    console.log(response);

    return response.data as SurveyQuestionReponse[];
  }

  async answerPHQSurvey(data: AnswerPHQSurveyData[]) {
    await this.client.post("/phq/daily/answer", data);
  }

  async doesPHQ9Questions(
    data: AnswerPHQSurveyData[],
  ): Promise<DoesPHQ9QuestionReponse> {
    if (data.length != 2) {
      throw new Error("O quiz não corresponde ao PHQ-2");
    }

    const response = await this.client.query("/phq/phq9/verify", data);

    

    return response.data;
  }
}

const surveyService = new SurveyService();
export default surveyService;
