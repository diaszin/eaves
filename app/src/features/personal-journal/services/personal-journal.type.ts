export interface EmotionsResponse {
  id: number;
  emotion: string;
}

export interface CreatePersonalJournalRequest {
  content: string;
  emotion: number;
}

export interface ViewAllPersonalJournalResponse {
  id: number;
  emotion: EmotionsResponse;
  createdBy: {
    id: number;
  };
  createdDate: string;
}
