export interface SurveyQuestionReponse {
    title: string;
    id: number;
    answers: SurveyAnswer[];
}

export interface SurveyAnswer {
    score: number;
    id: number;
    content: string;
}


export interface AnswerPHQSurveyData {
    questionId: number,
    answerId: number
}