// File: src/lib/scoring.ts
import { questions } from '../data/questions';
import { AssessmentResponse } from '../types';

// Map raw responses to 0-4 scale
export const mapResponseToScore = (responseType: string, value: string): number => {
  if (responseType === 'likert') return parseInt(value) - 1; // 1->0, 2->1, 3->2, 4->3, 5->4
  if (responseType === 'yes_no') return value === 'yes' ? 4 : 0;
  if (responseType === 'percentage') {
    if (value === 'lt25') return 1;
    if (value === '25-50') return 2;
    if (value === '51-75') return 3;
    if (value === 'gt75') return 4;
  }
  return 0;
};

// Calculate Maturity Level
export const getMaturityLevel = (score: number): string => {
  if (score <= 1) return 'Basic';
  if (score <= 2) return 'Opportunistic';
  if (score <= 3) return 'Systematic';
  if (score <= 3.5) return 'Differentiating';
  return 'Transformative';
};

// Main scoring engine (Individual)
export const calculateScores = (responses: AssessmentResponse) => {
  let totalWeightedScore = 0;
  let totalMaxWeight = 0;
  const pillarScores: Record<string, { current: number; max: number }> = {};
  
  questions.forEach((q) => {
    const rawVal = responses[q.id];
    if (!rawVal) return;

    const baseScore = mapResponseToScore(q.responseType, rawVal);
    const weightedScore = baseScore * q.weight;
    const maxQuestionScore = 4 * q.weight;

    totalWeightedScore += weightedScore;
    totalMaxWeight += maxQuestionScore;

    if (!pillarScores[q.pillar]) pillarScores[q.pillar] = { current: 0, max: 0 };
    pillarScores[q.pillar].current += weightedScore;
    pillarScores[q.pillar].max += maxQuestionScore;
  });

  const overallScore = totalMaxWeight > 0 ? (totalWeightedScore / totalMaxWeight) * 4 : 0;
  const pillarBreakdown = Object.entries(pillarScores).map(([pillar, data]) => ({
    name: pillar.split(' · ')[1] || pillar,
    score: data.max > 0 ? Number(((data.current / data.max) * 4).toFixed(2)) : 0,
    fullMark: 4,
  }));

  return {
    overallScore: Number(overallScore.toFixed(2)),
    maturityLevel: getMaturityLevel(overallScore),
    pillarBreakdown,
  };
};

// NEW: Aggregation Engine (Macro-level)
export const calculateAggregatedScores = (allResponses: any[]) => {
  const questionScores: Record<number, number[]> = {};

  // 1. Group all responses by question ID and convert to 0-4 scale
  allResponses.forEach(r => {
    const q = questions.find(qu => qu.id === r.question_id);
    if (!q) return;
    const score = mapResponseToScore(q.responseType, r.response_value);
    if (!questionScores[q.id]) questionScores[q.id] = [];
    questionScores[q.id].push(score);
  });

  let totalWeightedScore = 0;
  let totalMaxWeight = 0;
  const pillarScores: Record<string, { current: number; max: number }> = {};

  // 2. Calculate the average score for each question, then apply weights
  questions.forEach(q => {
    const scores = questionScores[q.id];
    if (!scores || scores.length === 0) return; // Skip if no one answered this question

    const avgBaseScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const weightedScore = avgBaseScore * q.weight;
    const maxQuestionScore = 4 * q.weight;

    totalWeightedScore += weightedScore;
    totalMaxWeight += maxQuestionScore;

    if (!pillarScores[q.pillar]) pillarScores[q.pillar] = { current: 0, max: 0 };
    pillarScores[q.pillar].current += weightedScore;
    pillarScores[q.pillar].max += maxQuestionScore;
  });

  const overallScore = totalMaxWeight > 0 ? (totalWeightedScore / totalMaxWeight) * 4 : 0;
  const pillarBreakdown = Object.entries(pillarScores).map(([pillar, data]) => ({
    name: pillar.split(' · ')[1] || pillar,
    score: data.max > 0 ? Number(((data.current / data.max) * 4).toFixed(2)) : 0,
    fullMark: 4,
  }));

  return {
    overallScore: Number(overallScore.toFixed(2)),
    maturityLevel: getMaturityLevel(overallScore),
    pillarBreakdown,
  };
};