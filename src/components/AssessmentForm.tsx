"use client";

import { useState, Suspense, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { questions } from '@/data/questions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, ChevronRight, ChevronLeft, User, ShieldCheck, FileCheck2, Send } from 'lucide-react';

function AssessmentFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL parameters
  const mode = searchParams.get('mode') || 'test';
  const urlStakeholderType = searchParams.get('type') || '';

  // State
  const [responses, setResponses] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasConsented, setHasConsented] = useState(false);

  const [details, setDetails] = useState({
    respondent_name: '',
    email: '',
    phone: '',
    organization: '',
    stakeholder_type: urlStakeholderType
  });

  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

  // Computed data
  const filteredQuestions = useMemo(() => {
    if (!details.stakeholder_type) return [];
    return questions.filter(q =>
      q.primaryStakeholder === details.stakeholder_type ||
      q.secondaryStakeholder === details.stakeholder_type ||
      q.secondaryStakeholder === 'NONE'
    );
  }, [details.stakeholder_type]);

  const activePillars = useMemo(() => {
    return Array.from(new Set(filteredQuestions.map(q => q.pillar)));
  }, [filteredQuestions]);

  const sections = ['profile', ...activePillars, 'review'];
  const currentSection = sections[currentSectionIndex];

  // Group current pillar's questions
  const currentPillarQuestions = useMemo(() => {
    if (currentSection === 'profile' || currentSection === 'review') return {};

    const qs = filteredQuestions.filter(q => q.pillar === currentSection);
    return qs.reduce((acc, q) => {
      if (!acc[q.subpillar]) acc[q.subpillar] = [];
      acc[q.subpillar].push(q);
      return acc;
    }, {} as Record<string, typeof questions[0][]>);
  }, [currentSection, filteredQuestions]);

  // Validation
  const isDetailsComplete = Boolean(details.respondent_name && details.email && details.organization && details.stakeholder_type);
  const totalQuestions = filteredQuestions.length;
  const answeredCount = Object.keys(responses).length;
  const isAllAnswered = totalQuestions > 0 && answeredCount === totalQuestions;
  const isComplete = isAllAnswered && isDetailsComplete && hasConsented;

  const progress = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  // Handlers
  const handleOptionChange = (questionId: number, value: string) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  const handleDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setDetails(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleNext = () => {
    if (currentSection === 'profile' && !isDetailsComplete) return; // Prevent advancing if details missing
    if (currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    if (!isComplete) return;
    console.log("Submitting assessment...", { details, answers: Object.keys(responses).length, mode });
    setIsSubmitting(true);

    // Safety timeout: If Supabase hangs for more than 15s, throw an error
    const timeout = setTimeout(() => {
      alert("Submission timed out. This may be due to a poor connection or database RLS policies. Please check your data or try again.");
      setIsSubmitting(false);
    }, 15000);

    try {
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
        clearTimeout(timeout);
        console.error("Profile storage error:", assessmentError);
        alert(`Could not save profile: ${assessmentError?.message || 'Unknown error'}. This is often caused by Supabase RLS policies blocking public inserts.`);
        setIsSubmitting(false);
        return;
      }

      console.log("Profile saved, ID:", assessment.id);

      const responseInserts = Object.entries(responses).map(([qId, val]) => ({
        assessment_id: assessment.id,
        question_id: parseInt(qId),
        response_value: val,
      }));

      const { error: responsesError } = await supabase
        .from('responses')
        .insert(responseInserts);

      clearTimeout(timeout);

      if (responsesError) {
        console.error("Answers storage error:", responsesError);
        alert(`Profile saved but answers failed: ${responsesError.message}. Accessing the dashboard might show your profile without scores.`);
        // We still redirect because partial success is better than no feedback
      }

      console.log("Redirecting to thank you...");
      window.location.href = '/thank-you';
    } catch (err: any) {
      clearTimeout(timeout);
      console.error("Submission crash:", err);
      alert(`Fatal Submission Error: ${err.message || 'Check console for details'}`);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-8">

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* SIDEBAR */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="sticky top-8 space-y-6">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Digital ID Governance Assessment</h2>

            <div className="space-y-4 pt-2">
              <div className="mb-2">
                <div className="flex justify-between text-sm font-medium mb-1">
                  <span className="text-slate-500">Overall Progress</span>
                  <span className="text-blue-600">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2 rounded-full" />
                <p className="text-xs text-slate-400 mt-2">{answeredCount} of {totalQuestions} questions answered</p>
              </div>

              <div className="flex flex-col gap-1 mt-6">
                {sections.map((sec, idx) => {
                  const isActive = idx === currentSectionIndex;

                  // Granular completion for pillars
                  let isCompleted = false;
                  let answeredInSec = 0;
                  let totalInSec = 0;

                  if (sec === 'profile') {
                    isCompleted = isDetailsComplete;
                  } else if (sec === 'review') {
                    isCompleted = isAllAnswered && hasConsented;
                  } else {
                    const pillarQuestions = filteredQuestions.filter(q => q.pillar === sec);
                    totalInSec = pillarQuestions.length;
                    answeredInSec = pillarQuestions.filter(q => responses[q.id]).length;
                    // Only complete if we have questions AND all are answered
                    isCompleted = totalInSec > 0 && answeredInSec === totalInSec;
                  }

                  const getIcon = () => {
                    if (sec === 'profile') return <User className="w-4 h-4" />;
                    if (sec === 'review') return <Send className="w-4 h-4" />;
                    return <FileCheck2 className="w-4 h-4" />;
                  }

                  const label = sec === 'profile' ? "Respondent Profile" : sec === 'review' ? "Review & Submit" : sec;

                  return (
                    <button
                      key={sec}
                      onClick={() => {
                        if (sec !== 'profile' && !isDetailsComplete) return;
                        setCurrentSectionIndex(idx);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`flex flex-col gap-1 w-full text-left p-3 rounded-xl transition-all duration-200 ease-in-out ${isActive ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' :
                        'text-slate-600 hover:bg-slate-100 cursor-pointer'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-md ${isActive ? 'bg-white/20' : isCompleted ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100'}`}>
                          {isCompleted && !isActive ? <CheckCircle2 className="w-4 h-4" /> : getIcon()}
                        </div>
                        <span className="font-bold text-xs uppercase tracking-wider truncate flex-1">{label}</span>
                      </div>

                      {/* PILLAR PROGRESS SUB-TEXT */}
                      {sec !== 'profile' && sec !== 'review' && totalInSec > 0 && (
                        <div className="pl-11 pr-2 flex justify-between items-center w-full">
                          <div className={`text-[10px] font-bold ${isActive ? 'text-blue-100' : isCompleted ? 'text-emerald-600' : 'text-slate-400'}`}>
                            {answeredInSec} / {totalInSec} ANSWERED
                          </div>
                          {!isCompleted && !isActive && (
                            <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={`mt-8 p-4 rounded-xl border ${mode === 'test' ? 'bg-slate-100 border-slate-200' : 'bg-red-50 border-red-200'}`}>
              <span className={`text-xs font-bold uppercase tracking-widest ${mode === 'test' ? 'text-slate-500' : 'text-red-600'}`}>Mode</span>
              <p className="text-sm font-medium mt-1">{mode === 'test' ? 'Test' : 'Live'}</p>
            </div>

          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="lg:col-span-3 space-y-6">

          {/* PROFILE SECTION */}
          {currentSection === 'profile' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-slate-900">Let's Get Started.</h1>
                <p className="text-slate-500 mt-2 text-lg">First, tell us a bit about yourself so we can tailor the assessment to your role.</p>
              </div>

              <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                  <CardTitle className="text-slate-800 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-500" />
                    Respondent Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 sm:p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
                      <input type="text" name="respondent_name" value={details.respondent_name} onChange={handleDetailsChange} className="w-full border-slate-200 border rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" required placeholder="Jane Doe" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Organization <span className="text-red-500">*</span></label>
                      <input type="text" name="organization" value={details.organization} onChange={handleDetailsChange} className="w-full border-slate-200 border rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" required placeholder="Ministry of Technology" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address <span className="text-red-500">*</span></label>
                      <input type="email" name="email" value={details.email} onChange={handleDetailsChange} className="w-full border-slate-200 border rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" required placeholder="jane@example.com" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone Number</label>
                      <input type="tel" name="phone" value={details.phone} onChange={handleDetailsChange} className="w-full border-slate-200 border rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="+1 (555) 000-0000" />
                    </div>
                    <div className="md:col-span-2 mt-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-3">Stakeholder Group <span className="text-red-500">*</span></label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                          { val: 'GOV', lbl: 'Government', desc: 'Policy, issuing, or public services' },
                          { val: 'REG', lbl: 'Regulator', desc: 'Compliance and oversight bodies' },
                          { val: 'PRI', lbl: 'Private Sector', desc: 'Relying parties and tech vendors' },
                          { val: 'CIV', lbl: 'Civil Society', desc: 'NGOs, advocates, and academia' }
                        ].map(st => (
                          <div
                            key={st.val}
                            onClick={() => {
                              if (!urlStakeholderType) setDetails(p => ({ ...p, stakeholder_type: st.val }));
                            }}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${details.stakeholder_type === st.val ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500 ring-offset-1' :
                              urlStakeholderType ? 'border-slate-200 opacity-60 cursor-not-allowed' : 'border-slate-200 hover:border-blue-200 hover:bg-slate-50'
                              }`}
                          >
                            <div className="flex items-center gap-3 mb-1">
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${details.stakeholder_type === st.val ? 'border-blue-600' : 'border-slate-300'}`}>
                                {details.stakeholder_type === st.val && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                              </div>
                              <span className="font-bold text-slate-800">{st.lbl} ({st.val})</span>
                            </div>
                            <p className="text-sm text-slate-500 pl-7">{st.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* PILLAR QUESTION SECTION */}
          {currentSection !== 'profile' && currentSection !== 'review' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
              <div className="mb-6">
                <h1 className="text-3xl font-extrabold text-slate-900 border-b border-slate-200 pb-4">{currentSection}</h1>
                <p className="text-slate-500 mt-3 text-lg">Answer the following questions to assess the maturity of this pillar.</p>
              </div>

              {Object.entries(currentPillarQuestions).map(([subpillar, qs]) => (
                <div key={subpillar} className="space-y-6 mb-12">
                  <h3 className="text-xl font-bold text-slate-700 bg-slate-100 inline-block px-4 py-1.5 rounded-lg">{subpillar}</h3>
                  <div className="grid gap-6">
                    {qs.map((q) => (
                      <Card key={q.id} className="border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 rounded-2xl">
                        <CardContent className="p-0">
                          <div className="p-6 sm:p-8 border-b border-slate-100 bg-white">
                            <div className="flex gap-4">
                              <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                                {q.id}
                              </div>
                              <div>
                                <h4 className="text-lg font-semibold text-slate-900 mb-2 leading-snug">{q.question}</h4>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100">
                                  {q.responseType.replace('_', ' ')}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="p-6 sm:p-8 bg-slate-50/50">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {q.anchors?.map(anchor => (
                                <div
                                  key={anchor.value}
                                  onClick={() => handleOptionChange(q.id, anchor.value)}
                                  className={`p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 ease-out group ${responses[q.id] === anchor.value
                                    ? 'bg-white border-blue-500 shadow-sm ring-1 ring-blue-500 scale-[1.01]'
                                    : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50 hover:shadow-sm'
                                    }`}
                                >
                                  <div className="flex gap-4">
                                    <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${responses[q.id] === anchor.value ? 'border-blue-600 bg-white' : 'border-slate-300 bg-slate-50 group-hover:border-blue-400'}`}>
                                      {responses[q.id] === anchor.value && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}
                                    </div>
                                    <div>
                                      <span className={`block font-bold mb-1 text-base ${responses[q.id] === anchor.value ? 'text-blue-900' : 'text-slate-700'}`}>{anchor.label}</span>
                                      <span className={`block text-sm leading-relaxed ${responses[q.id] === anchor.value ? 'text-blue-700/90' : 'text-slate-500'}`}>{anchor.description}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* REVIEW & SUBMIT SECTION */}
          {currentSection === 'review' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-8 text-center max-w-2xl mx-auto">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShieldCheck className="w-10 h-10 text-blue-600" />
                </div>
                <h1 className="text-3xl font-extrabold text-slate-900 mb-4">You're Almost Done!</h1>
                <p className="text-slate-500 text-lg">Review your progress and consent to data processing before submitting your assessment.</p>
              </div>

              <Card className="max-w-2xl mx-auto border-blue-200 shadow-lg rounded-2xl overflow-hidden border-2">
                <CardHeader className="bg-blue-50/50 border-b border-blue-100 text-center py-8">
                  <CardTitle className="text-2xl text-blue-900">Submission Ready</CardTitle>
                  <p className="text-blue-700 font-medium mt-2">
                    {isAllAnswered ? "All questions answered successfully." : `Missing responses: You have answered ${answeredCount} of ${totalQuestions} questions.`}
                  </p>
                </CardHeader>
                <CardContent className="p-8 space-y-8 bg-white">

                  <div className={`p-4 rounded-xl border flex items-start gap-4 transition-colors ${hasConsented ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="mt-0.5">
                      <input
                        type="checkbox"
                        id="consent"
                        checked={hasConsented}
                        onChange={(e) => setHasConsented(e.target.checked)}
                        className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </div>
                    <label htmlFor="consent" className="text-sm text-slate-700 cursor-pointer select-none leading-relaxed">
                      <span className="font-bold text-slate-900 block mb-1">Data Privacy Consent</span>
                      I agree that my responses will be securely stored and aggregated for the purpose of the Barbados Digital ID Governance Assessment framework analysis. I understand my personal data will be handled securely.
                    </label>
                  </div>

                  {!isComplete && (
                    <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 text-sm font-medium flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      Please complete all profile details, answer all questions, and provide consent to submit.
                    </div>
                  )}

                  <Button
                    onClick={handleSubmit}
                    disabled={!isComplete || isSubmitting}
                    size="lg"
                    className="w-full h-14 text-lg font-bold rounded-xl shadow-md bg-blue-600 hover:bg-blue-700 transition-all hover:shadow-lg disabled:opacity-50 disabled:shadow-none"
                  >
                    {isSubmitting ? "Submitting securely..." : "Submit Assessment"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* GLOBAL NEXT / PREV NAVIGATION BUTTONS */}
          <div className="flex justify-between items-center mt-12 py-6 border-t border-slate-200">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentSectionIndex === 0}
              className="h-12 px-6 rounded-xl border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
            >
              <ChevronLeft className="w-5 h-5 mr-2" /> Previous
            </Button>

            {currentSection !== 'review' && (
              <Button
                onClick={handleNext}
                disabled={currentSection === 'profile' && !isDetailsComplete}
                className="h-12 px-8 rounded-xl bg-slate-900 text-white hover:bg-slate-800 shadow-md font-semibold"
              >
                Continue <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default function AssessmentForm() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500 font-medium">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          Loading Assessment Framework...
        </div>
      </div>
    }>
      <AssessmentFormContent />
    </Suspense>
  );
}