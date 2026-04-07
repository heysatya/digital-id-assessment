export type ResponseType = 'likert' | 'yes_no' | 'percentage';

export interface Anchor {
  value: string;
  label: string;
  description?: string;
}

export interface Question {
  id: number;
  pillar: string;
  subpillar: string;
  question: string;
  responseType: ResponseType;
  weight: number;
  primaryStakeholder: string;
  secondaryStakeholder: string;
  anchors?: Anchor[];
}

export interface AssessmentResponse {
  [questionId: number]: string;
}

export interface ScoreData {
  name: string;
  score: number;
  fullMark: number;
}