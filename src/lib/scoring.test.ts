import { describe, it, expect } from 'vitest';
import { mapResponseToScore, getMaturityLevel, calculateScores, calculateAggregatedScores } from './scoring';
import { questions } from '../data/questions';

describe('Scoring Engine: mapResponseToScore', () => {
    it('maps v2 numeric strings correctly (0-4)', () => {
        expect(mapResponseToScore('likert', '0')).toBe(0);
        expect(mapResponseToScore('likert', '2')).toBe(2);
        expect(mapResponseToScore('likert', '4')).toBe(4);
    });

    it('handles "not_sure" as 0', () => {
        expect(mapResponseToScore('yes_no', 'not_sure')).toBe(0);
    });

    it('maintains backwards compatibility for v1 string values', () => {
        expect(mapResponseToScore('yes_no', 'yes')).toBe(4);
        expect(mapResponseToScore('yes_no', 'no')).toBe(0);
        expect(mapResponseToScore('percentage', 'lt25')).toBe(1);
        expect(mapResponseToScore('percentage', 'gt75')).toBe(4);
    });

    it('falls back to 0 for malformed input', () => {
        expect(mapResponseToScore('likert', 'invalid')).toBe(0);
        expect(mapResponseToScore('likert', '')).toBe(0);
    });
});

describe('Scoring Engine: getMaturityLevel (Boundaries)', () => {
    it('identifies Basic correctly (<= 1)', () => {
        expect(getMaturityLevel(0.5)).toBe('Basic');
        expect(getMaturityLevel(1.0)).toBe('Basic');
    });

    it('identifies Opportunistic correctly (<= 2)', () => {
        expect(getMaturityLevel(1.1)).toBe('Opportunistic');
        expect(getMaturityLevel(2.0)).toBe('Opportunistic');
    });

    it('identifies Systematic correctly (<= 3)', () => {
        expect(getMaturityLevel(2.1)).toBe('Systematic');
        expect(getMaturityLevel(3.0)).toBe('Systematic');
    });

    it('identifies Differentiating correctly (<= 3.5)', () => {
        expect(getMaturityLevel(3.1)).toBe('Differentiating');
        expect(getMaturityLevel(3.5)).toBe('Differentiating');
    });

    it('identifies Transformative correctly (> 3.5)', () => {
        expect(getMaturityLevel(3.6)).toBe('Transformative');
        expect(getMaturityLevel(4.0)).toBe('Transformative');
    });
});

describe('Scoring Engine: Individual calculation stability', () => {
    it('handles zero questions answered without crashing (no division by zero)', () => {
        const emptyResponses = {};
        const result = calculateScores(emptyResponses);
        expect(result.overallScore).toBe(0);
        expect(result.pillarBreakdown.length).toBe(0);
    });

    it('calculates perfect score (4.0) correctly', () => {
        // Mock all questions as answered with '4'
        const perfectResponses: Record<number, string> = {};
        questions.forEach(q => perfectResponses[q.id] = '4');
        
        const result = calculateScores(perfectResponses);
        expect(result.overallScore).toBe(4.0);
        expect(result.maturityLevel).toBe('Transformative');
    });
});

describe('Scoring Engine: Aggregated calculation & Triangulation', () => {
    it('applies 70/30 weighting between primary and secondary stakeholders', () => {
        // Target a single question for isolation testing if possible, 
        // but since calculateAggregatedScores loops through all 'questions', 
        // we'll mock a simple scenario with one question's worth of data.
        
        const targetQ = questions[0];
        const mockAssessments = [
            { id: '1', stakeholder_type: targetQ.primaryStakeholder },
            { id: '2', stakeholder_type: targetQ.secondaryStakeholder }
        ];
        
        const mockResponses = [
            { assessment_id: '1', question_id: targetQ.id, response_value: '4' }, // Primary = 4
            { assessment_id: '2', question_id: targetQ.id, response_value: '0' }  // Secondary = 0
        ];

        const result = calculateAggregatedScores(mockResponses, mockAssessments);
        
        // Expected: (4 * 0.7) + (0 * 0.3) = 2.8 for that question.
        // Since it's the only question with responses, overall should be 2.8.
        expect(result.overallScore).toBe(2.8);
    });

    it('applies the 5% Triangulation Bonus when 3+ different stakeholders respond', () => {
        const targetQ = questions[2]; // Using index 2 to avoid pillar conflicts if specific
        const mockAssessments = [
            { id: '1', stakeholder_type: targetQ.primaryStakeholder },
            { id: '2', stakeholder_type: targetQ.secondaryStakeholder },
            { id: '3', stakeholder_type: 'OTHER' } // 3rd stakeholder
        ];
        
        const mockResponses = [
            { assessment_id: '1', question_id: targetQ.id, response_value: '2' }, // Primary
            { assessment_id: '2', question_id: targetQ.id, response_value: '2' }, // Secondary
            { assessment_id: '3', question_id: targetQ.id, response_value: '2' }  // Other
        ];

        // Base score = 2.0 (weighted average of 2 and 2 is 2).
        // Bonus = 2.0 * 1.05 = 2.10
        const result = calculateAggregatedScores(mockResponses, mockAssessments);
        expect(result.overallScore).toBe(2.1);
    });

    it('caps final question score at 4.0 even after triangulation bonus', () => {
        const targetQ = questions[5];
        const mockAssessments = [
            { id: '1', stakeholder_type: targetQ.primaryStakeholder },
            { id: '2', stakeholder_type: targetQ.secondaryStakeholder },
            { id: '3', stakeholder_type: 'RANDOM' }
        ];
        
        const mockResponses = [
            { assessment_id: '1', question_id: targetQ.id, response_value: '4' },
            { assessment_id: '2', question_id: targetQ.id, response_value: '4' },
            { assessment_id: '3', question_id: targetQ.id, response_value: '4' }
        ];

        // Base = 4.0. Bonus 5% = 4.2. Must be capped at 4.0.
        const result = calculateAggregatedScores(mockResponses, mockAssessments);
        expect(result.overallScore).toBe(4.0);
    });
});
