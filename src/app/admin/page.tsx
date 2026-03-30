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

  // Deletion State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
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
  const filteredAssessments = assessments.filter(a => a.environment_mode === activeMode);
  const filteredAssessmentIds = filteredAssessments.map(a => a.id);
  const filteredResponses = allResponses.filter(r => filteredAssessmentIds.includes(r.assessment_id));
  const aggregatedData = filteredResponses.length > 0 ? calculateAggregatedScores(filteredResponses) : null;

  // --- CSV EXPORT LOGIC ---
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

  // --- DELETION LOGIC ---
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleDelete = async () => {
    if (!selectedIds.length || !window.confirm(`Are you sure you want to delete ${selectedIds.length} assessment(s)? This cannot be undone.`)) return;
    setIsDeleting(true);

    const { error } = await supabase.from('assessments').delete().in('id', selectedIds);

    if (error) {
      alert("Error deleting data: " + error.message);
    } else {
      setAssessments(prev => prev.filter(a => !selectedIds.includes(a.id)));
      setSelectedIds([]);
      alert("Selected records deleted successfully.");
    }
    setIsDeleting(false);
  };

  // NEW: Reset All Test Data Logic
  const handleResetTestData = async () => {
    if (!window.confirm("CRITICAL WARNING: Are you absolutely sure you want to wipe ALL test data? This cannot be undone.")) return;
    setIsDeleting(true);

    const { error } = await supabase.from('assessments').delete().eq('environment_mode', 'test');

    if (error) {
      alert("Error resetting test data: " + error.message);
    } else {
      setAssessments(prev => prev.filter(a => a.environment_mode !== 'test'));
      setSelectedIds([]);
      alert("All test data has been successfully wiped. You have a clean slate.");
    }
    setIsDeleting(false);
  };
  
  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header & Filters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b pb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Macro-Level Dashboard</h1>
            <p className="text-slate-500">Aggregated View of Digital ID Governance Maturity.</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            
            {/* NEW: RESET TEST DATA BUTTON (Only shows in Test Mode) */}
            {activeMode === 'test' && filteredAssessments.length > 0 && (
              <button 
                onClick={handleResetTestData}
                disabled={isDeleting}
                className="text-sm text-red-600 hover:text-red-800 font-bold underline disabled:opacity-50"
              >
                {isDeleting ? "Wiping..." : "⚠️ Reset All Test Data"}
              </button>
            )}

            <button 
              onClick={handleExportCSV}
              className="text-sm text-slate-600 hover:text-blue-600 font-medium underline"
            >
              Export Data to CSV
            </button>
            
            <div className="flex bg-slate-200 p-1 rounded-lg">
              <button 
                onClick={() => { setActiveMode('live'); setSelectedIds([]); }}
                className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeMode === 'live' ? 'bg-white shadow-sm text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}
              >
                LIVE DATA
              </button>
              <button 
                onClick={() => { setActiveMode('test'); setSelectedIds([]); }}
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
            <div className="flex justify-between items-end mt-12 mb-4">
              <h2 className="text-xl font-bold text-slate-800">Individual Submissions ({filteredAssessments.length})</h2>
              
              {/* BULK DELETE ACTION BAR */}
              {selectedIds.length > 0 && (
                <div className="flex items-center gap-4 bg-red-50 px-4 py-2 rounded-lg border border-red-200">
                  <span className="text-red-800 text-sm font-medium">{selectedIds.length} selected</span>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={handleDelete} 
                    disabled={isDeleting}
                    className="bg-red-600 hover:bg-red-700 h-8"
                  >
                    {isDeleting ? "Deleting..." : "Delete Permanently"}
                  </Button>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-100 text-slate-600 border-b">
                  <tr>
                    <th className="p-4 w-12 text-center">
                      <input 
                        type="checkbox" 
                        onChange={(e) => {
                          if (e.target.checked) setSelectedIds(filteredAssessments.map(a => a.id));
                          else setSelectedIds([]);
                        }}
                        checked={selectedIds.length === filteredAssessments.length && filteredAssessments.length > 0}
                        className="cursor-pointer w-4 h-4 mt-1"
                      />
                    </th>
                    <th className="p-4 font-semibold">Date</th>
                    <th className="p-4 font-semibold">Name</th>
                    <th className="p-4 font-semibold">Organization</th>
                    <th className="p-4 font-semibold">Group</th>
                    <th className="p-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredAssessments.map((a) => (
                    <tr key={a.id} className={`transition-colors ${selectedIds.includes(a.id) ? 'bg-blue-50/50 hover:bg-blue-50' : 'hover:bg-slate-50'}`}>
                      <td className="p-4 text-center">
                        <input 
                          type="checkbox" 
                          checked={selectedIds.includes(a.id)} 
                          onChange={() => toggleSelect(a.id)}
                          className="cursor-pointer w-4 h-4 mt-1"
                        />
                      </td>
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