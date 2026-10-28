export interface EmotionsResponse {
  id: number;
  emotion: string;
}

export interface CreatePersonalJournalRequest {
  content: string;
  emotion: number;
}
