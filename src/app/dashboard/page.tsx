"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { calculateAggregatedScores } from '@/lib/scoring';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, XAxis, YAxis, Tooltip, Bar, Cell } from 'recharts';

export default function DashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'viewer'>('viewer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [assessments, setAssessments] = useState<any[]>([]);
  const [allResponses, setAllResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeMode, setActiveMode] = useState<'live' | 'test'>('live');

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  // Helper to fetch user role from database
  const getRoleFromDB = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error || !data) {
      console.warn("Could not fetch user role from 'profiles'. Defaulting to 'viewer'.");
      return 'viewer';
    }
    return data.role as 'admin' | 'viewer';
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setIsAuthenticated(true);
        const role = await getRoleFromDB(session.user.id);
        setUserRole(role);
      }
    });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !authData.user) {
        alert("Invalid login credentials.");
        setLoading(false);
        return;
      }
      setIsAuthenticated(true);
      const role = await getRoleFromDB(authData.user.id);
      setUserRole(role);
    } catch (err) {
      alert("An unexpected error occurred.");
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setEmail('');
    setPassword('');
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    async function fetchData() {
      try {
        setLoading(true);
        const { data: aData, error: aError } = await supabase
          .from('assessments')
          .select('*')
          .order('created_at', { ascending: false });

        const { data: rData, error: rError } = await supabase
          .from('responses')
          .select('*');

        if (aError) throw aError;
        if (rError) throw rError;

        setAssessments(aData || []);
        setAllResponses(rData || []);

        // Intelligent Auto-Mode Selection
        if (aData && aData.length > 0) {
          const hasLive = aData.some(a => a.environment_mode === 'live');
          const hasTest = aData.some(a => a.environment_mode === 'test');

          if (!hasLive && hasTest && activeMode === 'live') {
            setActiveMode('test');
          }
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [isAuthenticated, activeMode]);

  const filteredAssessments = assessments.filter(a => a.environment_mode === activeMode);
  const otherModeAssessments = assessments.filter(a => a.environment_mode !== activeMode);
  const hasDataInOtherMode = otherModeAssessments.length > 0;
  const filteredAssessmentIds = filteredAssessments.map(a => a.id);
  const filteredResponses = allResponses.filter(r => filteredAssessmentIds.includes(r.assessment_id));
  const aggregatedData = filteredResponses.length > 0 ? calculateAggregatedScores(filteredResponses, filteredAssessments) : null;

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
    link.href = encodedUri;
    link.download = `digital_id_assessments_${activeMode}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleDelete = async () => {
    if (!selectedIds.length || !window.confirm(`Delete ${selectedIds.length} assessment(s)? This cannot be undone.`)) return;
    setIsDeleting(true);

    const { error: responseError } = await supabase.from('responses').delete().in('assessment_id', selectedIds);
    if (responseError) { alert("Error clearing responses"); setIsDeleting(false); return; }

    const { data, error } = await supabase.from('assessments').delete().in('id', selectedIds).select();

    if (error) { alert("Database Error"); }
    else if (!data || data.length === 0) { alert("⚠️ Deletion Blocked by Database Security."); }
    else {
      setAssessments(prev => prev.filter(a => !selectedIds.includes(a.id)));
      setSelectedIds([]);
    }
    setIsDeleting(false);
  };

  const handleResetTestData = async () => {
    if (!window.confirm("CRITICAL WARNING: Wipe ALL test data?")) return;
    setIsDeleting(true);

    const testAssessments = assessments.filter(a => a.environment_mode === 'test');
    const testIds = testAssessments.map(a => a.id);

    if (testIds.length > 0) {
      await supabase.from('responses').delete().in('assessment_id', testIds);
    }

    const { data, error } = await supabase.from('assessments').delete().eq('environment_mode', 'test').select();

    if (error) { alert("Database Error"); }
    else if (!data || data.length === 0) { alert("⚠️ Deletion Blocked by Security."); }
    else {
      setAssessments(prev => prev.filter(a => a.environment_mode !== 'test'));
      setSelectedIds([]);
    }
    setIsDeleting(false);
  };

  // --- CYBER-GLASS RENDER VARIANTS ---
  const fadeIn: any = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Neon Ambient Background */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

        <motion.div
          initial="hidden" animate="show" variants={fadeIn}
          className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl relative z-10"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-xl mb-4 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Digital ID Assessment Dashboard</h1>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950/50 border border-white/10 focus:border-blue-500/50 rounded-xl p-3 text-slate-100 placeholder-slate-600 outline-none transition-all"
                placeholder="Email Address" required
              />
            </div>
            <div>
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950/50 border border-white/10 focus:border-blue-500/50 rounded-xl p-3 text-slate-100 placeholder-slate-600 outline-none transition-all"
                placeholder="Password" required
              />
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium p-3 rounded-xl transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:shadow-[0_0_25px_rgba(37,99,235,0.6)] disabled:opacity-50 relative overflow-hidden"
            >
              {loading ? "Authenticating..." : "Access Dashboard"}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8 font-sans">
      <div className="max-w-[1400px] mx-auto space-y-8">

        {/* HEADER */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Digital ID Governance Assessment Dashboard
            </h1>
            <p className="text-slate-500 mt-2 font-medium">
              Aggregated View of Digital ID Governance Maturity.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {userRole === 'viewer' && (
              <span className="px-3 py-1 bg-orange-100 text-orange-800 border border-orange-200 rounded-full text-xs font-bold mr-2 flex items-center gap-2">
                <span className="text-lg leading-none">👁️</span> Read-Only Mode
              </span>
            )}

            <div className="flex bg-slate-200 p-1 rounded-lg">
              <button onClick={() => { setActiveMode('live'); setSelectedIds([]); }} className={`px-5 py-2 rounded-md text-sm font-bold transition-all ${activeMode === 'live' ? 'bg-white shadow-sm text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}>LIVE</button>
              <button onClick={() => { setActiveMode('test'); setSelectedIds([]); }} className={`px-5 py-2 rounded-md text-sm font-bold transition-all ${activeMode === 'test' ? 'bg-white shadow-sm text-purple-700' : 'text-slate-500 hover:text-slate-700'}`}>TEST</button>
            </div>

            <button onClick={handleExportCSV} className="text-sm font-medium px-4 py-2 border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 rounded-xl transition-all shadow-sm text-slate-700">
              Export CSV
            </button>
            <button onClick={handleLogout} className="text-sm font-medium px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 rounded-xl transition-all">
              Sign Out
            </button>
          </div>
        </div>

        {/* LOADING STATE - SKELETON */}
        {loading ? (
          <div className="space-y-6">
            <div className="w-full h-48 bg-slate-200 rounded-2xl animate-pulse" />
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="w-full h-[450px] bg-slate-200 rounded-2xl animate-pulse" />
              <div className="w-full h-[450px] bg-slate-200 rounded-2xl animate-pulse" />
            </div>
          </div>
        ) : filteredAssessments.length === 0 ? (
          /* EMPTY STATE */
          <div className="space-y-6">
            {hasDataInOtherMode && (
              <div
                onClick={() => setActiveMode(activeMode === 'live' ? 'test' : 'live')}
                className="cursor-pointer group p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 transition-colors hover:bg-amber-100"
              >
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 font-bold group-hover:scale-110 transition-transform">!</div>
                <div>
                  <p className="text-amber-800 font-bold text-sm">Found entries in {activeMode === 'live' ? 'TEST' : 'LIVE'} mode!</p>
                  <p className="text-amber-600 text-xs mt-0.5">Click here to switch modes and view the submitted assessments.</p>
                </div>
              </div>
            )}

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-24 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 text-3xl mb-4 border border-blue-100">📋</div>
              <h2 className="text-xl font-bold text-slate-700">No {activeMode.toUpperCase()} Data</h2>
              <p className="text-slate-500 mt-2 font-medium">There are currently no completed assessments in this mode.</p>
            </motion.div>
          </div>
        ) : (
          /* ACTIVE DATA DASHBOARD */
          <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }} className="space-y-8">

            {/* ROW 1: PRIMARY METRICS */}
            {aggregatedData ? (
              <motion.div variants={fadeIn} className="grid md:grid-cols-3 gap-6">
                <div className="md:col-start-2 overflow-hidden bg-white border border-slate-200 rounded-2xl p-8 text-center flex flex-col justify-center shadow-sm transition-shadow hover:shadow-md">
                  <h3 className="text-slate-500 text-xs tracking-[0.2em] font-bold mb-4 uppercase">Overall Maturity Index</h3>
                  <div className="text-7xl font-black text-slate-900">
                    {aggregatedData.overallScore} <span className="text-3xl text-slate-400">/ 4</span>
                  </div>
                  <div className="mt-6 inline-flex items-center mx-auto px-5 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-bold border border-blue-200">
                    Level: {aggregatedData.maturityLevel}
                  </div>
                  <p className="text-slate-500 font-medium text-xs mt-6 uppercase tracking-widest">Based on {filteredAssessments.length} Responses</p>
                </div>
              </motion.div>
            ) : (
              <div className="p-8 bg-blue-50 border border-blue-100 rounded-2xl text-center">
                <p className="text-blue-700 font-medium">Wait! Profiles have been recorded, but we are missing response data for scoring analysis.</p>
                <p className="text-blue-500 text-sm mt-1">This usually means the database RLS policies are blocking public users from saving their answers correctly.</p>
              </div>
            )}

            {/* ROW 2: DATA VISUALIZATION (RECHARTS) */}
            {aggregatedData && (
              <motion.div variants={fadeIn} className="grid lg:grid-cols-2 gap-8">
                {/* RADAR CHART PANEL */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-slate-800 font-bold mb-6 flex items-center gap-2">Pillar Footprint</h3>
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="55%" data={aggregatedData.pillarBreakdown}>
                        <PolarGrid stroke="#e2e8f0" />
                        <PolarAngleAxis
                          dataKey="name"
                          tick={({ payload, x, y, textAnchor, stroke, radius }: any) => {
                            const parts = payload.value.split(' · ');
                            return (
                              <text radius={radius} stroke={stroke} x={x} y={y} textAnchor={textAnchor} fill="#64748b" fontSize={11} fontWeight={500}>
                                <tspan x={x} dy="0">{parts[0]}</tspan>
                                {parts[1] && <tspan x={x} dy="14">{parts[1]}</tspan>}
                              </text>
                            );
                          }}
                        />
                        <PolarRadiusAxis angle={30} domain={[0, 4]} />
                        <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#cbd5e1', borderRadius: '8px' }} />
                        <Radar name="Maturity" dataKey="score" stroke="#2563eb" strokeWidth={2} fill="#3b82f6" fillOpacity={0.4} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* BAR CHART PANEL */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-slate-800 font-bold mb-6 flex items-center gap-2">Pillar Average Scores</h3>
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={aggregatedData.pillarBreakdown} layout="vertical" margin={{ top: 10, right: 40, left: 0, bottom: 10 }}>
                        <XAxis type="number" domain={[0, 4]} tick={{ fill: '#64748b', fontSize: 11 }} />
                        <YAxis type="category" dataKey="name" width={180} tick={{ fill: '#475569', fontSize: 12, fontWeight: 500 }} />
                        <Tooltip
                          cursor={{ fill: '#f1f5f9' }}
                          formatter={(value: any) => [`${value} / 4.0`, 'Score']}
                          contentStyle={{ backgroundColor: '#fff', borderColor: '#cbd5e1', borderRadius: '8px', color: '#1e293b', fontWeight: 'bold' }}
                        />
                        <Bar dataKey="score" radius={[0, 6, 6, 0]} fill="#2563eb" activeBar={{ fill: '#1d4ed8' }}>
                          {aggregatedData.pillarBreakdown.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#6366f1'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>
            )}


            {/* DATA TABLE */}
            <motion.div variants={fadeIn} className="mt-12 space-y-4">
              <div className="flex justify-between items-end mb-4">
                <h2 className="text-xl font-extrabold text-slate-800">Response Submissions</h2>

                <div className="flex items-center gap-4">
                  {userRole === 'admin' && activeMode === 'test' && filteredAssessments.length > 0 && (
                    <button onClick={handleResetTestData} disabled={isDeleting} className="text-sm font-bold text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-2 border border-red-200 rounded-xl transition-all shadow-sm">
                      {isDeleting ? "Purging..." : "Purge Test Data"}
                    </button>
                  )}

                  {userRole === 'admin' && selectedIds.length > 0 && (
                    <div className="flex items-center gap-4 bg-red-50 px-4 py-2 rounded-xl border border-red-200 shadow-sm animate-in fade-in duration-300">
                      <span className="text-red-700 text-sm font-bold">{selectedIds.length} Targeted</span>
                      <button onClick={handleDelete} disabled={isDeleting} className="text-sm bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-1.5 rounded-lg shadow-sm transition-all">
                        {isDeleting ? "Erasing..." : "Delete Permanently"}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-slate-100 text-slate-600 border-b border-slate-200">
                      <tr>
                        {userRole === 'admin' && (
                          <th className="p-4 w-12 text-center">
                            <input
                              type="checkbox"
                              onChange={(e) => e.target.checked ? setSelectedIds(filteredAssessments.map(a => a.id)) : setSelectedIds([])}
                              checked={selectedIds.length === filteredAssessments.length && filteredAssessments.length > 0}
                              className="accent-blue-600 w-4 h-4 rounded cursor-pointer"
                            />
                          </th>
                        )}
                        <th className="p-5 font-bold uppercase text-xs tracking-wide">Date, Time</th>
                        <th className="p-5 font-bold uppercase text-xs tracking-wide">Name</th>
                        <th className="p-5 font-bold uppercase text-xs tracking-wide">Organization</th>
                        <th className="p-5 font-bold uppercase text-xs tracking-wide">Group</th>
                        <th className="p-5 font-bold uppercase text-xs tracking-wide text-right">Access</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <AnimatePresence>
                        {filteredAssessments.map((a) => (
                          <motion.tr
                            key={a.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={`transition-colors group hover:bg-slate-50 ${selectedIds.includes(a.id) ? 'bg-blue-50/50' : ''}`}
                          >
                            {userRole === 'admin' && (
                              <td className="p-4 text-center">
                                <input type="checkbox" checked={selectedIds.includes(a.id)} onChange={() => toggleSelect(a.id)} className="accent-blue-600 w-4 h-4 cursor-pointer" />
                              </td>
                            )}
                            <td className="p-5 text-slate-500 font-medium text-xs">{new Date(a.created_at).toLocaleString()}</td>
                            <td className="p-5 font-bold text-slate-900">{a.respondent_name || 'Anonymous'}</td>
                            <td className="p-5 text-slate-600 font-medium">{a.organization || 'N/A'}</td>
                            <td className="p-5">
                              <span className="bg-slate-200 text-slate-700 px-3 py-1 rounded-full text-xs font-bold">
                                {a.stakeholder_type}
                              </span>
                            </td>
                            <td className="p-5 text-right">
                              <Link href={`/results/${a.id}`} target="_blank" className="text-blue-600 font-bold hover:text-blue-800 transition-colors flex justify-end items-center gap-1 group-hover:underline">
                                Inspect Deep Dive &rarr;
                              </Link>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </main>
  );
}