// File: src/components/ResultsDashboard.tsx
"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { calculateScores } from '@/lib/scoring';
import { AssessmentResponse } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, XAxis, YAxis, Tooltip, Bar } from 'recharts';

export default function ResultsDashboard({ assessmentId }: { assessmentId: string }) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      const { data: responses, error } = await supabase
        .from('responses')
        .select('*')
        .eq('assessment_id', assessmentId);

      if (error || !responses) return;

      const formattedResponses: AssessmentResponse = {};
      responses.forEach(r => {
        formattedResponses[r.question_id] = r.response_value;
      });

      const scores = calculateScores(formattedResponses);
      setData(scores);
    }
    fetchData();
  }, [assessmentId]);

  if (!data) return <div className="p-10 text-center text-slate-500">Loading your comprehensive results...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 py-10 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-slate-900">Assessment Results</h1>
        
        {/* New beautifully formatted Reference ID and Copy Button */}
        <div className="flex items-center justify-center gap-2 mt-2">
          <p className="text-slate-500 bg-slate-100 px-3 py-1 rounded-full text-sm font-mono border">
            Ref: {assessmentId.split('-')[0].toUpperCase()}
          </p>
          <button 
            onClick={() => navigator.clipboard.writeText(window.location.href)}
            className="text-sm text-blue-600 hover:text-blue-800 underline transition-colors"
          >
            Copy Report Link
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Overall Score Card */}
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

        {/* Radar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Pillar Footprint</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Fix: Explicit height instead of 100% */}
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data.pillarBreakdown}>
                <PolarGrid />
                <PolarAngleAxis dataKey="name" tick={{ fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 4]} />
                <Radar name="Score" dataKey="score" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bar Chart Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Pillar Scores</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Fix: Explicit height instead of 100% */}
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data.pillarBreakdown} layout="vertical" margin={{ left: 150 }}>
              <XAxis type="number" domain={[0, 4]} />
              <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 12 }} />
              <Tooltip cursor={{fill: '#f1f5f9'}} />
              <Bar dataKey="score" fill="#2563eb" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}