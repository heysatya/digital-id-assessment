"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { pillars, groupedByPillar } from '@/data/questions';
import { AssessmentResponse, Question } from '@/types';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function AssessmentForm() {
  const router = useRouter();
  const [currentPillarIdx, setCurrentPillarIdx] = useState(0);
  const [responses, setResponses] = useState<AssessmentResponse>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentPillar = pillars[currentPillarIdx];
  const subpillars = groupedByPillar[currentPillar];
  const progress = ((currentPillarIdx) / pillars.length) * 100;

  const handleSelect = (questionId: number, value: string) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleNext = async () => {
    if (currentPillarIdx < pillars.length - 1) {
      setCurrentPillarIdx((prev) => prev + 1);
      window.scrollTo(0, 0);
    } else {
      setIsSubmitting(true);
      
      // 1. Create assessment record
      const { data: assessment, error: aError } = await supabase
        .from('assessments')
        .insert([{}])
        .select()
        .single();

      if (aError || !assessment) {
        alert("Failed to save assessment.");
        setIsSubmitting(false);
        return;
      }

      // 2. Prepare responses for DB
      const dbResponses = Object.entries(responses).map(([qId, val]) => ({
        assessment_id: assessment.id,
        question_id: parseInt(qId),
        response_value: val,
      }));

      const { error: rError } = await supabase.from('responses').insert(dbResponses);

      if (rError) {
        alert("Failed to save responses.");
        setIsSubmitting(false);
        return;
      }

      router.push(`/results/${assessment.id}`);
    }
  };

  const renderInput = (q: Question) => {
    if (q.responseType === 'yes_no') {
      return (
        <div className="flex gap-4 mt-3">
          {['yes', 'no'].map((opt) => (
            <button
              key={opt}
              onClick={() => handleSelect(q.id, opt)}
              className={`px-4 py-2 border rounded-md capitalize transition-colors ${responses[q.id] === opt ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:bg-slate-50'}`}
            >
              {opt}
            </button>
          ))}
        </div>
      );
    }

    if (q.responseType === 'likert') {
      return (
        <div className="flex flex-wrap gap-2 mt-3">
          {[1, 2, 3, 4, 5].map((val) => (
            <button
              key={val}
              onClick={() => handleSelect(q.id, val.toString())}
              className={`w-10 h-10 border rounded-md transition-colors ${responses[q.id] === val.toString() ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:bg-slate-50'}`}
            >
              {val}
            </button>
          ))}
        </div>
      );
    }

    if (q.responseType === 'percentage') {
      const options = [
        { label: '<25%', val: 'lt25' },
        { label: '25-50%', val: '25-50' },
        { label: '51-75%', val: '51-75' },
        { label: '>75%', val: 'gt75' }
      ];
      return (
        <div className="flex flex-wrap gap-3 mt-3">
          {options.map((opt) => (
            <button
              key={opt.val}
              onClick={() => handleSelect(q.id, opt.val)}
              className={`px-4 py-2 border rounded-md transition-colors ${responses[q.id] === opt.val ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:bg-slate-50'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 py-8">
      {/* Progress Bar */}
      <div className="w-full bg-slate-200 h-2 mb-8 rounded-full overflow-hidden">
        <div className="bg-blue-600 h-2 transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      <h2 className="text-2xl font-bold mb-6 text-slate-800">{currentPillar}</h2>

      {Object.entries(subpillars).map(([subpillar, qs]) => (
        <div key={subpillar} className="mb-8">
          <h3 className="text-lg font-semibold text-slate-600 mb-4">{subpillar}</h3>
          <div className="space-y-4">
            {qs.map((q) => (
              <Card key={q.id}>
                <CardContent className="p-5">
                  <p className="font-medium text-slate-900">{q.question}</p>
                  {renderInput(q)}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      <div className="flex justify-between mt-8">
        <Button 
          variant="outline" 
          disabled={currentPillarIdx === 0}
          onClick={() => setCurrentPillarIdx(p => p - 1)}
        >
          Previous
        </Button>
        <Button onClick={handleNext} disabled={isSubmitting}>
          {currentPillarIdx === pillars.length - 1 ? (isSubmitting ? 'Calculating...' : 'Submit Assessment') : 'Next Pillar'}
        </Button>
      </div>
    </div>
  );
}