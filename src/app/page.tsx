import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          Digital ID Maturity Assessment
        </h1>
        <p className="text-lg text-slate-600">
          Evaluate the maturity of your national digital ID system using a unified framework combining governance and DPI safeguards.
        </p>
        <Link href="/assessment">
          <Button size="lg" className="mt-4">Start Assessment</Button>
        </Link>
      </div>
    </main>
  );
}