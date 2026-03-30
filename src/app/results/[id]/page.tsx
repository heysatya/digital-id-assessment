// File: src/app/results/[id]/page.tsx
import ResultsDashboard from '@/components/ResultsDashboard';

// In Next.js 15+, params is a Promise that must be awaited
export default async function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  return (
    <main className="min-h-screen bg-slate-50">
      <ResultsDashboard assessmentId={resolvedParams.id} />
    </main>
  );
}