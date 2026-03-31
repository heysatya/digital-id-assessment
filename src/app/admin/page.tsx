// File: src/app/admin/page.tsx
"use client";

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { calculateAggregatedScores } from '@/lib/scoring';
import Link from 'next/link';
import Papa from 'papaparse'; // NEW: The CSV Parser
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, XAxis, YAxis, Tooltip, Bar } from 'recharts';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  
  const [assessments, setAssessments] = useState<any[]>([]);
  const [allResponses, setAllResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeMode, setActiveMode] = useState<'live' | 'test'>('live');

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // NEW: Upload State
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl border-slate-700 bg-slate-800 text-white">
          <CardHeader><CardTitle className="text-center text-2xl text-slate-100">Admin Control Center</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Enter Passcode</label>
                <input 
                  type="password" value={passcode} onChange={(e) => setPasscode(e.target.value)} 
                  className="w-full border-none rounded-md p-3 bg-slate-950 text-white" placeholder="••••••••"
                />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">Unlock Dashboard</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredAssessments = assessments.filter(a => a.environment_mode === activeMode);
  const filteredAssessmentIds = filteredAssessments.map(a => a.id);
  const filteredResponses = allResponses.filter(r => filteredAssessmentIds.includes(r.assessment_id));
  const aggregatedData = filteredResponses.length > 0 ? calculateAggregatedScores(filteredResponses) : null;

  // --- NEW: FRAMEWORK UPLOAD LOGIC ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          // 1. Map Excel columns to Database columns
          const formattedData = results.data.map((row: any) => ({
            pillar: row['Pillar'],
            subpillar: row['Subpillar'],
            question: row['Question'],
            response_type: row['Response Type'],
            score_mapping: row['Score Mapping'],
            weight: parseFloat(row['Weight']) || 1, // Fallback to 1 if empty
            primary_stakeholder: row['Primary Stakeholder'],
            secondary_stakeholder: row['Secondary Stakeholder']
          }));

          // 2. Clear out the old framework questions safely
          const { error: deleteError } = await supabase.from('framework_questions').delete().neq('id', 0);
          if (deleteError) throw deleteError;

          // 3. Insert the new spreadsheet data
          const { error: insertError } = await supabase.from('framework_questions').insert(formattedData);
          if (insertError) throw insertError;

          alert(`Success! Uploaded ${formattedData.length} questions to the database.`);
        } catch (error: any) {
          alert('Error uploading to database: ' + error.message);
        } finally {
          setIsUploading(false);
          if (fileInputRef.current) fileInputRef.current.value = ''; // Reset input
        }
      },
      error: (error) => {
        alert('Error parsing the CSV file: ' + error.message);
        setIsUploading(false);
      }
    });
  };

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
    link.setAttribute("download", `digital_id_assessments_${activeMode}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleDelete = async () => {
    if (!selectedIds.length || !window.confirm(`Are you sure you want to delete ${selectedIds.length} assessment(s)? This cannot be undone.`)) return;
    setIsDeleting(true);

    const { error: responseError } = await supabase.from('responses').delete().in('assessment_id', selectedIds);
    if (responseError) { alert("Error clearing responses: " + responseError.message); setIsDeleting(false); return; }

    const { data, error } = await supabase.from('assessments').delete().in('id', selectedIds).select();

    if (error) { alert("Database Error: " + error.message); } 
    else if (!data || data.length === 0) { alert("⚠️ Deletion Blocked by Database Security."); } 
    else {
      setAssessments(prev => prev.filter(a => !selectedIds.includes(a.id)));
      setSelectedIds([]);
      alert("Selected records deleted successfully.");
    }
    setIsDeleting(false);
  };

  const handleResetTestData = async () => {
    if (!window.confirm("CRITICAL WARNING: Are you absolutely sure you want to wipe ALL test data? This cannot be undone.")) return;
    setIsDeleting(true);

    const testAssessments = assessments.filter(a => a.environment_mode === 'test');
    const testIds = testAssessments.map(a => a.id);

    if (testIds.length > 0) {
      await supabase.from('responses').delete().in('assessment_id', testIds);
    }

    const { data, error } = await supabase.from('assessments').delete().eq('environment_mode', 'test').select();

    if (error) { alert("Database Error: " + error.message); } 
    else if (!data || data.length === 0) { alert("⚠️ Deletion Blocked by Database Security."); } 
    else {
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
            <h1 className="text-3xl font-bold text-slate-900">Digital ID Governance Assessment Dashboard</h1>
            <p className="text-slate-500">Aggregated view of Digital ID Governance Maturity.</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            
            {/* NEW: UPLOAD FRAMEWORK BUTTON */}
            <div>
              <input 
                type="file" 
                accept=".csv" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
              />
              <Button 
                onClick={() => fileInputRef.current?.click()} 
                disabled={isUploading}
                variant="outline"
                className="bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 font-medium"
              >
                {isUploading ? "Uploading..." : "📤 Upload Framework CSV"}
              </Button>
            </div>

            {activeMode === 'test' && filteredAssessments.length > 0 && (
              <button onClick={handleResetTestData} disabled={isDeleting} className="text-sm text-red-600 hover:text-red-800 font-bold underline disabled:opacity-50">
                {isDeleting ? "Wiping..." : "⚠️ Reset All Test Data"}
              </button>
            )}
            
            <button onClick={handleExportCSV} className="text-sm text-slate-600 hover:text-blue-600 font-medium underline">
              Export Data to CSV
            </button>
            
            <div className="flex bg-slate-200 p-1 rounded-lg">
              <button onClick={() => { setActiveMode('live'); setSelectedIds([]); }} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeMode === 'live' ? 'bg-white shadow-sm text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}>LIVE DATA</button>
              <button onClick={() => { setActiveMode('test'); setSelectedIds([]); }} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeMode === 'test' ? 'bg-white shadow-sm text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}>TEST DATA</button>
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
          <div className="space-y-8">
            
            {/* ROW 1: SCORE CARD */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="md:col-start-2 bg-slate-900 border-slate-800 text-center flex flex-col justify-center py-8 shadow-lg">
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
            </div>

            {/* ROW 2: THE CHARTS */}
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="shadow-sm">
                <CardHeader><CardTitle className="text-slate-800">Pillar Footprint</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={450}>
                    <RadarChart cx="50%" cy="50%" outerRadius="55%" data={aggregatedData.pillarBreakdown}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="name" tick={{ fontSize: 11, fill: '#475569' }} />
                      <PolarRadiusAxis angle={30} domain={[0, 4]} />
                      <Radar name="Score" dataKey="score" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.4} />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* HORIZONTAL LEFT-JUSTIFIED BAR CHART */}
              <Card className="shadow-sm">
                <CardHeader><CardTitle className="text-slate-800">Pillar Averages</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={450}>
                    <BarChart data={aggregatedData.pillarBreakdown} layout="vertical" margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                      <XAxis type="number" domain={[0, 4]} tick={{ fontSize: 11, fill: '#475569' }} />
                      <YAxis type="category" dataKey="name" width={250} tick={{ fontSize: 11, fill: '#475569', textAnchor: 'start', dx: -240 }} />
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
              {selectedIds.length > 0 && (
                <div className="flex items-center gap-4 bg-red-50 px-4 py-2 rounded-lg border border-red-200">
                  <span className="text-red-800 text-sm font-medium">{selectedIds.length} selected</span>
                  <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700 h-8">
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
                        onChange={(e) => e.target.checked ? setSelectedIds(filteredAssessments.map(a => a.id)) : setSelectedIds([])}
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
                        <input type="checkbox" checked={selectedIds.includes(a.id)} onChange={() => toggleSelect(a.id)} className="cursor-pointer w-4 h-4 mt-1" />
                      </td>
                      <td className="p-4 text-slate-500">{new Date(a.created_at).toLocaleDateString()}</td>
                      <td className="p-4 font-medium text-slate-900">{a.respondent_name || 'Anonymous'}</td>
                      <td className="p-4 text-slate-600">{a.organization || 'N/A'}</td>
                      <td className="p-4"><span className="bg-slate-200 text-slate-700 px-2 py-1 rounded text-xs font-bold">{a.stakeholder_type}</span></td>
                      <td className="p-4 text-right">
                        <Link href={`/results/${a.id}`} target="_blank" className="text-blue-600 hover:text-blue-800 font-medium hover:underline">View Deep Dive &rarr;</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}