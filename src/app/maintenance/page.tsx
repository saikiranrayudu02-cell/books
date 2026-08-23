import { AlertTriangle } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Maintenance Mode | Tenali Exam Publisher',
  description: 'Currently the application is on maintenance mode please try again later.',
};

export default function MaintenancePage() {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-slate-50 dark:bg-[#1a1b1e] p-6 text-center">
      <div className="max-w-md w-full bg-white dark:bg-[#25262b] rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 flex flex-col items-center">
        <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 text-orange-500 rounded-full flex items-center justify-center mb-6 animate-pulse">
          <AlertTriangle size={40} strokeWidth={1.5} />
        </div>
        
        <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-4">
          Maintenance Mode
        </h1>
        
        <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed font-medium">
          Currently the application is on maintenance mode please try agaain later
        </p>
      </div>
    </div>
  );
}
