import { Question } from '../types';

const rawQuestions = [
  // ... (Your exact provided JSON array goes here)
  { "pillar": "P1 · Legal & Regulatory Foundations", "subpillar": "1.1 Legal Authority & Civil Registration Linkage", "question": "How comprehensive is the legal authority and scope of the Trident system?", "responseType": "likert", "weight": 3, "primaryStakeholder": "REG", "secondaryStakeholder": "GOV" },
  { "pillar": "P1 · Legal & Regulatory Foundations", "subpillar": "1.1 Legal Authority & Civil Registration Linkage", "question": "Is Trident legally linked to the civil registration system as the foundational identity source?", "responseType": "yes_no", "weight": 3, "primaryStakeholder": "REG", "secondaryStakeholder": "GOV" },
  // ... Imagine the other 54 questions pasted here ...
  { "pillar": "P6 · Ecosystem, Market & Sustainability", "subpillar": "6.5 Environmental Sustainability", "question": "Was a comprehensive environmental impact assessment conducted and published during the Trident rollout?", "responseType": "yes_no", "weight": 2, "primaryStakeholder": "GOV", "secondaryStakeholder": "CIV" }
];

export const questions: Question[] = rawQuestions.map((q, index) => ({
  ...q,
  id: index,
  responseType: q.responseType as 'likert' | 'yes_no' | 'percentage',
}));

export const groupedByPillar = questions.reduce((acc, question) => {
  if (!acc[question.pillar]) acc[question.pillar] = {};
  if (!acc[question.pillar][question.subpillar]) acc[question.pillar][question.subpillar] = [];
  acc[question.pillar][question.subpillar].push(question);
  return acc;
}, {} as Record<string, Record<string, Question[]>>);

export const pillars = Object.keys(groupedByPillar);