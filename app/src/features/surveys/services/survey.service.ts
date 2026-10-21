import { AxiosInstance } from "axios";
import { surveyClient } from "./surveys.client";
import { AnswerPHQSurveyData, SurveyQuestionReponse } from "./survey.type";

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
}

const surveyService = new SurveyService();
export default surveyService;
