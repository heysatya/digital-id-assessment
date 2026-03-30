// File: src/app/admin/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { calculateAggregatedScores } from '@/lib/scoring';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, XAxis, YAxis, Tooltip, Bar } from 'recharts';

export default function AdminDashboard() {
  // Security State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  
  // Data State
  const [assessments, setAssessments] = useState<any[]>([]);
  const [allResponses, setAllResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Filter State (Segregate Test vs Live)
  const [activeMode, setActiveMode] = useState<'live' | 'test'>('live');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple frontend lock for MVP. 
    if (passcode === 'DigitalIDAssessmentAdmin') setIsAuthenticated(true);
    else alert('Incorrect Passcode');
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    async function fetchData() {
      setLoading(true);
      const { data: aData } = await supabase.from('assessments').select('*').order('created_at', { ascending: false });
      const { data: rData } = await supabase.from('responses').select('*');
      if (aData) setAssessments(aData);
      if (rData) setAllResponses(rData);
      setLoading(false);
    }
    fetchData();
  }, [isAuthenticated]);

  // Security Gate UI
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl border-slate-700 bg-slate-800 text-white">
          <CardHeader>
            <CardTitle className="text-center text-2xl text-slate-100">Admin Control Center</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Enter Passcode</label>
                <input 
                  type="password" 
                  value={passcode} 
                  onChange={(e) => setPasscode(e.target.value)} 
                  className="w-full border-none rounded-md p-3 bg-slate-950 text-white" 
                  placeholder="••••••••"
                />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">Unlock Dashboard</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- AGGREGATION LOGIC ---
  // 1. Filter assessments by the active mode (Live vs Test)
  const filteredAssessments = assessments.filter(a => a.environment_mode === activeMode);
  const filteredAssessmentIds = filteredAssessments.map(a => a.id);
  
  // 2. Grab only the responses that belong to those filtered assessments
  const filteredResponses = allResponses.filter(r => filteredAssessmentIds.includes(r.assessment_id));
  
  // 3. Run the macro-math
  const aggregatedData = filteredResponses.length > 0 ? calculateAggregatedScores(filteredResponses) : null;

  // NEW: CSV Export Logic
  const handleExportCSV = () => {
    const headers = ["Date", "Name", "Organization", "Group", "Mode"];
    const rows = filteredAssessments.map(a => [
      new Date(a.created_at).toLocaleDateString(),
      `"${a.respondent_name || 'Anonymous'}"`,
      `"${a.organization || 'N/A'}"`,
      a.stakeholder_type,
      a.environment_mode
    ].join(','));
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `trident_assessments_${activeMode}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header & Filters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b pb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Macro-Level Dashboard</h1>
            <p className="text-slate-500">Aggregated view of Trident Framework maturity.</p>
          </div>
          <div className="flex items-center gap-4">
            {/* NEW EXPORT BUTTON */}
            <button 
              onClick={handleExportCSV}
              className="text-sm text-slate-600 hover:text-blue-600 font-medium underline"
            >
              Export Data to CSV
            </button>
            
            <div className="flex bg-slate-200 p-1 rounded-lg">
              <button 
                onClick={() => setActiveMode('live')}
                className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeMode === 'live' ? 'bg-white shadow-sm text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}
              >
                LIVE DATA
              </button>
              <button 
                onClick={() => setActiveMode('test')}
                className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeMode === 'test' ? 'bg-white shadow-sm text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}
              >
                TEST DATA
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-500">Compiling aggregated data...</div>
        ) : !aggregatedData ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
            <p className="text-slate-500">No {activeMode.toUpperCase()} submissions found yet.</p>
          </div>
        ) : (
          <>
            {/* AGGREGATED CHARTS */}
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="bg-slate-900 border-slate-800 text-center flex flex-col justify-center py-8">
                <CardHeader>
                  <CardTitle className="text-slate-400 text-sm tracking-widest uppercase">Aggregated Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-7xl font-black text-white">{aggregatedData.overallScore} <span className="text-3xl text-slate-500">/ 4</span></div>
                  <div className="mt-6 inline-flex items-center px-4 py-1.5 rounded-full bg-blue-600/20 text-blue-400 font-semibold border border-blue-500/30">
                    {aggregatedData.maturityLevel}
                  </div>
                  <p className="text-slate-500 text-sm mt-4">Based on {filteredAssessments.length} submissions</p>
                </CardContent>
              </Card>

              <Card className="lg:col-span-1">
                <CardHeader><CardTitle className="text-sm">Pillar Footprint</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart cx="50%" cy="50%" outerRadius="65%" data={aggregatedData.pillarBreakdown}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} />
                      <PolarRadiusAxis angle={30} domain={[0, 4]} />
                      <Radar name="Score" dataKey="score" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.4} />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="lg:col-span-1">
                <CardHeader><CardTitle className="text-sm">Pillar Averages</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={aggregatedData.pillarBreakdown} layout="vertical" margin={{ left: 100 }}>
                      <XAxis type="number" domain={[0, 4]} />
                      <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 10 }} />
                      <Tooltip cursor={{fill: '#f1f5f9'}} />
                      <Bar dataKey="score" fill="#2563eb" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* INDIVIDUAL SUBMISSIONS TABLE */}
            <h2 className="text-xl font-bold text-slate-800 mt-12 mb-4">Individual Submissions ({filteredAssessments.length})</h2>
            <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-100 text-slate-600 border-b">
                  <tr>
                    <th className="p-4 font-semibold">Date</th>
                    <th className="p-4 font-semibold">Name</th>
                    <th className="p-4 font-semibold">Organization</th>
                    <th className="p-4 font-semibold">Group</th>
                    <th className="p-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredAssessments.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 text-slate-500">{new Date(a.created_at).toLocaleDateString()}</td>
                      <td className="p-4 font-medium text-slate-900">{a.respondent_name || 'Anonymous'}</td>
                      <td className="p-4 text-slate-600">{a.organization || 'N/A'}</td>
                      <td className="p-4">
                        <span className="bg-slate-200 text-slate-700 px-2 py-1 rounded text-xs font-bold">
                          {a.stakeholder_type}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Link href={`/results/${a.id}`} target="_blank" className="text-blue-600 hover:text-blue-800 font-medium hover:underline">
                          View Deep Dive &rarr;
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </main>
  );
}