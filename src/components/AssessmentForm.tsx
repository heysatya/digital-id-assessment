"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { groupedByPillar, pillars, questions } from '@/data/questions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export default function AssessmentForm() {
  const router = useRouter();
  const [responses, setResponses] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic calculations for progress tracking
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(responses).length;
  const progress = (answeredCount / totalQuestions) * 100;
  const isComplete = answeredCount === totalQuestions;

  const handleOptionChange = (questionId: number, value: string) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    if (!isComplete) return; // Hard-lock: physically prevents submission if incomplete
    setIsSubmitting(true);

    // 1. Create Assessment Record
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .insert([{}])
      .select()
      .single();

    if (assessmentError || !assessment) {
      console.error(assessmentError);
      setIsSubmitting(false);
      return;
    }

    // 2. Prepare responses for DB
    const responseInserts = Object.entries(responses).map(([qId, val]) => ({
      assessment_id: assessment.id,
      question_id: parseInt(qId),
      response_value: val,
    }));

    // 3. Insert Responses
    const { error: responsesError } = await supabase
      .from('responses')
      .insert(responseInserts);

    if (responsesError) {
      console.error(responsesError);
      setIsSubmitting(false);
      return;
    }

    // 4. Navigate to Results
    router.push(`/results/${assessment.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 relative">
      
      {/* STICKY PROGRESS BAR */}
      <div className="sticky top-0 z-50 bg-slate-50/90 backdrop-blur-md py-4 border-b border-slate-200 shadow-sm mb-8">
        <div className="flex justify-between items-end mb-2">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Trident Maturity Assessment</h2>
            <p className="text-sm text-slate-500">
              {isComplete 
                ? "🎉 All questions answered! Ready to submit." 
                : "Please answer all questions to unlock your results."}
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-blue-600">{answeredCount}</span>
            <span className="text-slate-400 font-medium"> / {totalQuestions}</span>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* SCORING GUIDE */}
      <Card className="bg-blue-50 border-blue-100 mb-8 shadow-sm">
        <CardHeader>
          <CardTitle className="text-blue-800 text-lg">Scoring Guide (Likert Scale 1-5)</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-900 space-y-2">
          <p><strong>1 (Basic):</strong> No standardized processes; ad-hoc or non-existent capabilities.</p>
          <p><strong>2 (Opportunistic):</strong> Early planning stages; localized or informal implementations.</p>
          <p><strong>3 (Systematic):</strong> Formalized processes in place; consistent but siloed execution.</p>
          <p><strong>4 (Differentiating):</strong> Highly integrated, monitored, and legally backed operations.</p>
          <p><strong>5 (Transformative):</strong> State-of-the-art, proactive, universally accessible, and optimized.</p>
        </CardContent>
      </Card>

      {/* QUESTION LIST */}
      <div className="space-y-12">
        {pillars.map((pillar) => (
          <div key={pillar} className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800 border-b pb-2">{pillar}</h2>

            {Object.entries(groupedByPillar[pillar]).map(([subpillar, qs]) => (
              <Card key={subpillar} className="shadow-sm">
                <CardHeader className="bg-slate-100/50">
                  <CardTitle className="text-lg text-slate-700">{subpillar}</CardTitle>
                </CardHeader>
                <CardContent className="divide-y">
                  {qs.map((q) => (
                    <div key={q.id} className="py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="md:w-1/2">
                        <p className="text-sm font-medium text-slate-900">{q.question}</p>
                        <p className="text-xs text-slate-400 mt-1 uppercase tracking-wide">
                          Stakeholders: {q.primaryStakeholder} / {q.secondaryStakeholder}
                        </p>
                      </div>
                      <div className="md:w-1/2 flex flex-wrap gap-2 justify-end">
                        {q.responseType === 'likert' && [1, 2, 3, 4, 5].map(val => (
                          <Button
                            key={val}
                            type="button"
                            variant={responses[q.id] === String(val) ? 'default' : 'outline'}
                            onClick={() => handleOptionChange(q.id, String(val))}
                            className="w-10 h-10 p-0"
                          >
                            {val}
                          </Button>
                        ))}
                        {q.responseType === 'yes_no' && ['yes', 'no'].map(val => (
                          <Button
                            key={val}
                            type="button"
                            variant={responses[q.id] === val ? 'default' : 'outline'}
                            onClick={() => handleOptionChange(q.id, val)}
                            className="w-16 capitalize"
                          >
                            {val}
                          </Button>
                        ))}
                        {q.responseType === 'percentage' && [
                          { label: '<25%', val: 'lt25' },
                          { label: '25-50%', val: '25-50' },
                          { label: '51-75%', val: '51-75' },
                          { label: '>75%', val: 'gt75' }
                        ].map(opt => (
                          <Button
                            key={opt.val}
                            type="button"
                            variant={responses[q.id] === opt.val ? 'default' : 'outline'}
                            onClick={() => handleOptionChange(q.id, opt.val)}
                            className="w-20"
                          >
                            {opt.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        ))}
      </div>

      {/* STICKY SUBMIT FOOTER */}
      <div className="sticky bottom-0 z-50 bg-slate-50/90 backdrop-blur-md py-4 border-t border-slate-200 text-center mt-12">
        {!isComplete && (
          <p className="text-red-500 text-sm font-medium mb-2">
            You must answer {totalQuestions - answeredCount} more questions to submit.
          </p>
        )}
        <Button
          onClick={handleSubmit}
          disabled={!isComplete || isSubmitting}
          size="lg"
          className="w-full md:w-auto px-12 text-lg h-14"
        >
          {isSubmitting ? "Calculating Results..." : "Submit Assessment"}
        </Button>
      </div>
    </div>
  );
}