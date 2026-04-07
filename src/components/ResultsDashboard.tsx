// File: src/components/ResultsDashboard.tsx
"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { calculateScores } from '@/lib/scoring';
import { AssessmentResponse } from '@/types';
import { groupedByPillar, pillars } from '@/data/questions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, XAxis, YAxis, Tooltip, Bar } from 'recharts';

export default function ResultsDashboard({ assessmentId }: { assessmentId: string }) {
  const [data, setData] = useState<any>(null);
  const [assessment, setAssessment] = useState<any>(null);
  const [rawResponses, setRawResponses] = useState<Record<number, string>>({});

  useEffect(() => {
    async function fetchData() {
      // 1. Fetch the Respondent Profile
      const { data: profile } = await supabase
        .from('assessments')
        .select('*')
        .eq('id', assessmentId)
        .single();
      
      if (profile) setAssessment(profile);

      // 2. Fetch the Responses
      const { data: responses, error } = await supabase
        .from('responses')
        .select('*')
        .eq('assessment_id', assessmentId);

      if (error || !responses) return;

      // 3. Format responses for math engine AND display
      const formattedResponses: AssessmentResponse = {};
      responses.forEach(r => {
        formattedResponses[r.question_id] = r.response_value;
      });

      setRawResponses(formattedResponses);
      setData(calculateScores(formattedResponses));
    }
    fetchData();
  }, [assessmentId]);

  if (!data || !assessment) return <div className="p-10 text-center text-slate-500">Loading Deep Dive Report...</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 py-10 space-y-10">
      
      {/* 1. RESPONDENT HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b pb-6">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Individual Deep Dive</h1>
          <p className="text-xl text-slate-700">{assessment.respondent_name || 'Anonymous Respondent'}</p>
          <p className="text-slate-500">{assessment.organization || 'No Organization Provided'}</p>
        </div>
        <div className="text-right space-y-2">
          <div className="flex gap-2 justify-end">
             <span className="bg-slate-800 text-white px-3 py-1 rounded-full text-xs font-bold tracking-widest">
               {assessment.stakeholder_type}
             </span>
             <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-widest ${assessment.environment_mode === 'live' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
               {assessment.environment_mode?.toUpperCase()}
             </span>
          </div>
          
          {/* EXPORT BUTTONS (Hidden during printing) */}
          <div className="flex items-center justify-end gap-2 mt-2 print:hidden">
            <p className="text-slate-400 bg-slate-50 px-2 py-1 rounded text-xs font-mono border">
              Ref: {assessmentId.split('-')[0].toUpperCase()}
            </p>
            <button 
              onClick={() => window.print()}
              className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
            >
              Save as PDF
            </button>
          </div>
        </div>
      </div>

      {/* 2. MATURITY CHARTS */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-blue-50 border-blue-100 text-center flex flex-col justify-center py-8">
          <CardHeader>
            <CardTitle className="text-blue-800 text-xl">Overall Maturity Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-6xl font-black text-blue-600">{data.overallScore} <span className="text-2xl text-blue-400">/ 4.0</span></div>
            <div className="mt-4 inline-flex items-center px-4 py-1.5 rounded-full bg-blue-600 text-white font-semibold shadow-sm">
              Level: {data.maturityLevel}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Pillar Footprint</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart cx="50%" cy="50%" outerRadius="55%" data={data.pillarBreakdown}>
                <PolarGrid />
                <PolarAngleAxis 
                  dataKey="name" 
                  tick={({ payload, x, y, textAnchor, stroke, radius }: any) => {
                    const parts = payload.value.split(' · ');
                    return (
                      <text radius={radius} stroke={stroke} x={x} y={y} textAnchor={textAnchor} fill="#64748b" fontSize={10} fontWeight={500}>
                        <tspan x={x} dy="0">{parts[0]}</tspan>
                        {parts[1] && <tspan x={x} dy="14">{parts[1]}</tspan>}
                      </text>
                    );
                  }} 
                />
                <PolarRadiusAxis angle={30} domain={[0, 4]} />
                <Radar name="Score" dataKey="score" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Detailed Pillar Scores</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={450}>
            <BarChart data={data.pillarBreakdown} layout="vertical" margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
              <XAxis type="number" domain={[0, 4]} tick={{ fontSize: 11, fill: '#475569' }} />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={250} 
                tick={{ 
                  fontSize: 11, 
                  fill: '#475569', 
                  textAnchor: 'start', 
                  dx: -240 
                }} 
              />
              <Tooltip cursor={{fill: '#f1f5f9'}} />
              <Bar dataKey="score" fill="#2563eb" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 3. ITEM-BY-ITEM QUESTION LOG */}
      <div className="mt-16 space-y-8">
        <div className="border-b pb-4 mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Complete Response Log</h2>
          <p className="text-slate-500">Raw survey inputs provided by {assessment.respondent_name || 'this user'}.</p>
        </div>

        {pillars.map((pillar) => (
          <Card key={pillar} className="shadow-sm border-slate-200 overflow-hidden">
            <CardHeader className="bg-slate-100/50 border-b">
              <CardTitle className="text-lg text-slate-800">{pillar}</CardTitle>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-slate-100">
              {Object.entries(groupedByPillar[pillar]).map(([subpillar, qs]) => {
                // HIDE questions that were never assigned to this stakeholder
                const relevantQs = qs.filter(q => 
                  q.primaryStakeholder === assessment.stakeholder_type || 
                  q.secondaryStakeholder === assessment.stakeholder_type || 
                  q.secondaryStakeholder === 'NONE'
                );

                if (relevantQs.length === 0) return null;

                return (
                <div key={subpillar} className="p-4 md:p-6 bg-white">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">{subpillar}</h3>
                  <div className="space-y-3">
                    {relevantQs.map((q) => {
                      const rawValue = rawResponses[q.id];
                      let displayValue = 'Skipped';
                      if (rawValue !== undefined && rawValue !== null) {
                        const matchedAnchor = q.anchors?.find(a => a.value === rawValue);
                        if (matchedAnchor) {
                          displayValue = q.responseType === 'likert' ? `${matchedAnchor.label}: ${matchedAnchor.description}` : matchedAnchor.label;
                        } else if (q.responseType === 'percentage') {
                          if (rawValue === 'lt25') displayValue = '< 25%';
                          else if (rawValue === 'gt75') displayValue = '> 75%';
                          else displayValue = rawValue;
                        } else {
                          displayValue = rawValue;
                        }
                      }

                      return (
                      <div key={q.id} className="flex flex-col md:flex-row md:items-start justify-between gap-4 text-sm hover:bg-slate-50 p-2 rounded-md transition-colors">
                        <span className="text-slate-700 font-medium md:w-3/4">{q.question}</span>
                        <div className="md:w-1/4 flex justify-end">
                          <span className={`font-bold text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full text-center shadow-sm ${displayValue === 'Skipped' ? 'opacity-50 text-slate-500 bg-slate-100 border-slate-200' : ''}`}>
                            {displayValue}
                          </span>
                        </div>
                      </div>
                      );
                    })}
                  </div>
                </div>
              )})}
            </CardContent>
          </Card>
        ))}
      </div>
      
    </div>
  );
}