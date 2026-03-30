// File: src/app/admin/page.tsx
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

// Next.js config to ensure this page never caches and always shows fresh data
export const revalidate = 0;

export default async function AdminDashboard() {
  // Fetch all assessments from newest to oldest
  const { data: assessments } = await supabase
    .from('assessments')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Control Center</h1>
          <p className="text-slate-500">View and manage all stakeholder submissions.</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-600 border-b">
              <tr>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Name</th>
                <th className="p-4 font-semibold">Organization</th>
                <th className="p-4 font-semibold">Type</th>
                <th className="p-4 font-semibold">Mode</th>
                <th className="p-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {assessments?.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-slate-500">{new Date(a.created_at).toLocaleDateString()}</td>
                  <td className="p-4 font-medium text-slate-900">{a.respondent_name || 'Anonymous'}</td>
                  <td className="p-4 text-slate-600">{a.organization || 'N/A'}</td>
                  <td className="p-4">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold">{a.stakeholder_type}</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${a.environment_mode === 'live' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      {a.environment_mode?.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <Link href={`/results/${a.id}`} className="text-blue-600 hover:text-blue-800 font-medium hover:underline">
                      View Scores &rarr;
                    </Link>
                  </td>
                </tr>
              ))}
              {!assessments?.length && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">No submissions yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}