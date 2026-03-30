"use client";

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { groupedByPillar, pillars, questions } from '@/data/questions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

function AssessmentFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Read URL parameters (default to 'test' and 'OTHER' if link is clicked without them)
  const mode = searchParams.get('mode') || 'test';
  const urlStakeholderType = searchParams.get('type') || '';

  const [responses, setResponses] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // New Respondent Details State
  const [details, setDetails] = useState({
    respondent_name: '',
    email: '',
    phone: '',
    organization: '',
    stakeholder_type: urlStakeholderType
  });

  const totalQuestions = questions.length;
  const answeredCount = Object.keys(responses).length;
  const progress = (answeredCount / totalQuestions) * 100;
  
  // Check if all questions AND required details are filled
  const isDetailsComplete = details.respondent_name && details.email && details.organization && details.stakeholder_type;
  const isComplete = (answeredCount === totalQuestions) && isDetailsComplete;

  const handleOptionChange = (questionId: number, value: string) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  const handleDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setDetails(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!isComplete) return;
    setIsSubmitting(true);

    // 1. Create Assessment Record with Respondent Metadata
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .insert([{
        respondent_name: details.respondent_name,
        email: details.email,
        phone: details.phone,
        organization: details.organization,
        stakeholder_type: details.stakeholder_type,
        environment_mode: mode
      }])
      .select()
      .single();

    if (assessmentError || !assessment) {
      console.error(assessmentError);
      setIsSubmitting(false);
      return;
    }

    // 2. Insert Responses
    const responseInserts = Object.entries(responses).map(([qId, val]) => ({
      assessment_id: assessment.id,
      question_id: parseInt(qId),
      response_value: val,
    }));

    await supabase.from('responses').insert(responseInserts);

    // 3. Navigate to Thank You page (Admin will view results later)
    router.push(`/thank-you`);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 relative">
      {/* STICKY PROGRESS BAR */}
      <div className="sticky top-0 z-50 bg-slate-50/90 backdrop-blur-md py-4 border-b border-slate-200 shadow-sm mb-8">
        <div className="flex justify-between items-end mb-2">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Trident Maturity Assessment</h2>
            <div className="flex items-center gap-2 mt-1">
               <span className={`px-2 py-0.5 rounded text-xs font-bold ${mode === 'live' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                 {mode.toUpperCase()} MODE
               </span>
               <p className="text-sm text-slate-500">
                 {isComplete ? "🎉 Ready to submit." : "Please complete all details and questions."}
               </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-blue-600">{answeredCount}</span>
            <span className="text-slate-400 font-medium"> / {totalQuestions}</span>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* RESPONDENT DETAILS FORM */}
      <Card className="border-blue-200 shadow-sm border-2">
        <CardHeader className="bg-blue-50/50">
          <CardTitle className="text-blue-900">Respondent Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
              <input type="text" name="respondent_name" value={details.respondent_name} onChange={handleDetailsChange} className="w-full border rounded-md p-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Organization *</label>
              <input type="text" name="organization" value={details.organization} onChange={handleDetailsChange} className="w-full border rounded-md p-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address *</label>
              <input type="email" name="email" value={details.email} onChange={handleDetailsChange} className="w-full border rounded-md p-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
              <input type="tel" name="phone" value={details.phone} onChange={handleDetailsChange} className="w-full border rounded-md p-2" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Stakeholder Group *</label>
              <select name="stakeholder_type" value={details.stakeholder_type} onChange={handleDetailsChange} className="w-full border rounded-md p-2" disabled={!!urlStakeholderType} required>
                <option value="">Select Group...</option>
                <option value="GOV">Government (GOV)</option>
                <option value="REG">Regulator (REG)</option>
                <option value="PRI">Private Sector (PRI)</option>
                <option value="CIV">Civil Society (CIV)</option>
              </select>
            </div>
          </div>
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
                      </div>
                      <div className="md:w-1/2 flex flex-wrap gap-2 justify-end">
                        {q.responseType === 'likert' && [1, 2, 3, 4, 5].map(val => (
                          <Button key={val} type="button" variant={responses[q.id] === String(val) ? 'default' : 'outline'} onClick={() => handleOptionChange(q.id, String(val))} className="w-10 h-10 p-0">{val}</Button>
                        ))}
                        {q.responseType === 'yes_no' && ['yes', 'no'].map(val => (
                          <Button key={val} type="button" variant={responses[q.id] === val ? 'default' : 'outline'} onClick={() => handleOptionChange(q.id, val)} className="w-16 capitalize">{val}</Button>
                        ))}
                        {q.responseType === 'percentage' && [
                          { label: '<25%', val: 'lt25' }, { label: '25-50%', val: '25-50' }, { label: '51-75%', val: '51-75' }, { label: '>75%', val: 'gt75' }
                        ].map(opt => (
                          <Button key={opt.val} type="button" variant={responses[q.id] === opt.val ? 'default' : 'outline'} onClick={() => handleOptionChange(q.id, opt.val)} className="w-20">{opt.label}</Button>
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

      {/* SUBMIT FOOTER */}
      <div className="sticky bottom-0 z-50 bg-slate-50/90 backdrop-blur-md py-4 border-t border-slate-200 text-center mt-12">
        {!isComplete && (
          <p className="text-red-500 text-sm font-medium mb-2">
            Please fill out your profile details and answer all {totalQuestions} questions to submit.
          </p>
        )}
        <Button onClick={handleSubmit} disabled={!isComplete || isSubmitting} size="lg" className="w-full md:w-auto px-12 text-lg h-14">
          {isSubmitting ? "Submitting securely..." : "Submit Assessment"}
        </Button>
      </div>
    </div>
  );
}

// Next.js requires wrapping components that use useSearchParams in a Suspense boundary
export default function AssessmentForm() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading Assessment Engine...</div>}>
      <AssessmentFormContent />
    </Suspense>
  );
}