import { AxiosInstance } from "axios";
import { personalJournalClient } from "./personal-journal.client";
import { EmotionsResponse } from "./personal-journal.type";

export class PersonalJournalService {
  private client: AxiosInstance = personalJournalClient;

  async getEmotions(): Promise<EmotionsResponse[]> {
    const response = await this.client.get("/emotions");

    return response.data;
  }
}

const personalJournalService = new PersonalJournalService();
export default personalJournalService;
