import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { Receipt, PieChart, Info, ArrowUpRight } from 'lucide-react';
import type { Expense, Participant } from '@/lib/types';

async function getTransparencyData() {
  try {
    const expSnap = await getDocs(query(collection(db, 'expenses'), orderBy('created_at', 'desc')));
    const participantsSnap = await getDocs(collection(db, 'participants'));
    
    return {
      expenses: expSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Expense[],
      totalShares: participantsSnap.size
    };
  } catch (err) {
    console.error('Error fetching transparency data:', err);
    return { expenses: [], totalShares: 0 };
  }
}

export default async function ExpensesPage() {
  const { expenses, totalShares } = await getTransparencyData();
  
  const totalSharedExpenses = expenses
    .filter(e => e.item_type === 'shared')
    .reduce((sum, e) => sum + Number(e.amount), 0);
  
  const expensePerShare = totalShares > 0 ? totalSharedExpenses / totalShares : 0;

  return (
    <main className="min-h-screen bg-slate-50 font-sans">
      <section className="emerald-gradient text-white pt-24 pb-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-10 pointer-events-none" />
        <div className="container mx-auto px-6 relative z-10">
          <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter">Community Transparency</h1>
          <p className="text-emerald-100/70 text-lg max-w-xl font-medium leading-relaxed">
            We believe in complete trust and transparency. Here is how your contributions are being utilized for this year's Qurbani.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-6 -mt-16 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Summary Card */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-emerald-100 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <PieChart size={120} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Total Community Expenses</p>
              <h2 className="text-5xl font-black text-primary tracking-tighter mb-6">${totalSharedExpenses.toFixed(2)}</h2>
              
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <p className="text-[10px] uppercase tracking-widest text-emerald-600 font-bold mb-1">Individual Dividend</p>
                  <p className="text-2xl font-black text-primary">${expensePerShare.toFixed(2)} <span className="text-xs text-slate-400 font-medium">per share</span></p>
                </div>
                <div className="flex items-start gap-2 p-4 text-slate-500 text-xs italic">
                  <Info size={14} className="shrink-0 mt-0.5 text-secondary" />
                  <p>Individual dividends are calculated by dividing total community expenses (transport, feed, etc.) by the total number of booked shares ({totalShares}).</p>
                </div>
              </div>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden flex flex-col">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Receipt className="text-secondary" />
                <h3 className="text-xl font-bold text-primary tracking-tight">Expense Ledger</h3>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Live Updates</span>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[500px]">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-widest font-bold">
                    <th className="px-8 py-5">Item Description</th>
                    <th className="px-8 py-5">Date Posted</th>
                    <th className="px-8 py-5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {expenses.length > 0 ? expenses.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="font-bold text-primary">{e.description}</div>
                        <div className="text-[10px] text-emerald-600 font-black uppercase tracking-wider">Shared Cost</div>
                      </td>
                      <td className="px-8 py-6 text-sm text-slate-400 font-medium">
                        {new Date(e.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <span className="text-lg font-black text-slate-900">${Number(e.amount).toFixed(2)}</span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={3} className="px-8 py-20 text-center text-slate-400 font-medium italic">
                        No community expenses have been recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-8 bg-slate-50/50 text-center border-t border-slate-50">
              <a href="/" className="inline-flex items-center gap-2 text-primary hover:text-secondary font-bold text-xs uppercase tracking-widest transition-colors">
                Back to Dashboard <ArrowUpRight size={14} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
