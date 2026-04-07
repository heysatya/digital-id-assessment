// File: src/app/thank-you/page.tsx
export default function ThankYouPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border p-8 text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-3xl">✓</div>
        <h1 className="text-2xl font-bold text-slate-900">Submission Successful</h1>
        <p className="text-slate-600">
          Thank you for completing the Barbados Digital ID Governance Assessment Questionnaire. Your responses have been securely recorded and will be compiled into the final report.
        </p>
      </div>
    </main>
  );
}