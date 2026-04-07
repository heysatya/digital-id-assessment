import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50 overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-200/40 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-200/40 blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-3xl text-center space-y-8 bg-white/60 p-12 rounded-3xl border border-white/50 shadow-xl backdrop-blur-md">
        <div className="mx-auto w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20 mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>

        <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
          Digital ID Maturity <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Assessment Framework</span>
        </h1>

        <p className="text-xl text-slate-600 font-medium">
          This streamlined framework provides a comprehensive, rights-based diagnostic assessment of digital ID systems, integrating the UNDP Model Governance Framework and DPI Safeguards principles.
        </p>

        <div className="pt-4">
          <Link href="/assessment">
            <Button size="lg" className="h-14 px-10 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 bg-blue-600 hover:bg-blue-700">
              Start Assessment
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}