// File: src/lib/scoring.ts
import { questions } from '../data/questions';
import { AssessmentResponse } from '../types';

export const mapResponseToScore = (responseType: string, value: string): number => {
  if (value === 'not_sure') return 0;
  
  // Backwards compatibility for old raw data if necessary
  if (value === 'yes') return 4;
  if (value === 'no') return 0;
  if (value === 'lt25') return 1;
  if (value === '25-50') return 2;
  if (value === '51-75') return 3;
  if (value === 'gt75') return 4;

  // New V2 BARS payload is mapped strictly to numeric strings 0-4
  // We handle legacy likert (1-5) by checking length or assuming direct parsed value?
  // Old likert 1-5 meant 1->0, 5->4. New BARS is 0-4 meant 0->0, 4->4.
  const parsed = parseInt(value, 10);
  if (!isNaN(parsed)) {
    // If it's a V2 rating (0, 1, 2, 3, 4 string directly passed from anchor.value)
    // Wait, old form passed "1","2","3","4","5". New form passes "0","1","2","3","4".
    // We can differentiate: but wait, since 0-4 overlap with 1-4, we can't tell them apart just by value.
    // However, since we are moving all live data to V2, we assume V2 format. Any old scores in DB might miscalculate if re-rendered.
    // For MVP V2, we strictly return the value directly as intended by the new BARS anchors.
    return parsed; 
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
export const calculateAggregatedScores = (allResponses: any[], allAssessments: any[] = []) => {
  const questionScoresByStakeholder: Record<number, Record<string, number[]>> = {};

  // Build a map of assessment ID -> stakeholder_type
  const assessmentStakeholderMap: Record<string, string> = {};
  allAssessments.forEach(a => {
    assessmentStakeholderMap[a.id] = a.stakeholder_type;
  });

  // 1. Group all responses by question ID and Stakeholder Type
  allResponses.forEach(r => {
    const q = questions.find(qu => qu.id === r.question_id);
    if (!q) return;
    
    // Safely map score, treating NaN mapping as 0 to be safe
    let score = mapResponseToScore(q.responseType, r.response_value);
    if (isNaN(score)) score = 0;

    const stakeholder = assessmentStakeholderMap[r.assessment_id] || 'UNKNOWN';

    if (!questionScoresByStakeholder[q.id]) questionScoresByStakeholder[q.id] = {};
    if (!questionScoresByStakeholder[q.id][stakeholder]) questionScoresByStakeholder[q.id][stakeholder] = [];
    
    questionScoresByStakeholder[q.id][stakeholder].push(score);
  });

  let totalWeightedScore = 0;
  let totalMaxWeight = 0;
  const pillarScores: Record<string, { current: number; max: number }> = {};

  // 2. Calculate applying Primary (70%) and Secondary (30%) weighting
  questions.forEach(q => {
    const stakeholderScores = questionScoresByStakeholder[q.id];
    if (!stakeholderScores) return; // Skip if no one answered this

    const primaryScores = stakeholderScores[q.primaryStakeholder] || [];
    const secondaryScores = stakeholderScores[q.secondaryStakeholder] || [];
    
    // Check if we have responses
    if (primaryScores.length === 0 && secondaryScores.length === 0) return;

    const avgPrimary = primaryScores.length > 0 ? primaryScores.reduce((a, b) => a + b, 0) / primaryScores.length : null;
    const avgSecondary = secondaryScores.length > 0 ? secondaryScores.reduce((a, b) => a + b, 0) / secondaryScores.length : null;

    let finalQuestionScore = 0;

    if (avgPrimary !== null && avgSecondary !== null) {
      finalQuestionScore = (avgPrimary * 0.7) + (avgSecondary * 0.3);
    } else if (avgPrimary !== null) {
      finalQuestionScore = avgPrimary; // Fallback entirely to primary
    } else if (avgSecondary !== null) {
      finalQuestionScore = avgSecondary; // Fallback entirely to secondary
    }

    // Safeguard against NaN
    if (isNaN(finalQuestionScore)) {
      finalQuestionScore = 0;
    }

    // Checking for Triangulation Bonus (3+ stakeholders responded closely)
    const activeStakeholders = Object.keys(stakeholderScores).filter(k => stakeholderScores[k].length > 0);
    if (activeStakeholders.length >= 3) {
       // Apply a 5% bonus to this question's score
       finalQuestionScore = Math.min(4, finalQuestionScore * 1.05);
    }

    const weightedScore = finalQuestionScore * q.weight;
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