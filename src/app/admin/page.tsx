'use client';

import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, UserCheck, CreditCard, Printer, 
  Plus, Receipt, DollarSign, Lock, LogOut, Download
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { addExpense, updateParticipantPayment } from '@/app/actions';
import type { AnimalStatus, Participant, Expense } from '@/lib/types';
import { cn } from '@/lib/utils';
import * as XLSX from 'xlsx';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [data, setData] = useState<{
    animals: AnimalStatus[];
    participants: Participant[];
    expenses: Expense[];
  }>({ animals: [], participants: [], expenses: [] });
  const [loading, setLoading] = useState(true);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'adha123eidul') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid password');
    }
  };

  const fetchAllData = async () => {
    const supabase = createClient();
    const { data: animals } = await supabase.from('animal_status').select('*').order('type');
    const { data: participants } = await supabase.from('participants').select('*, animals(type, price_per_share)').order('created_at');
    const { data: expenses } = await supabase.from('expenses').select('*').order('created_at', { ascending: false });
    
    setData({ 
      animals: animals || [], 
      participants: participants || [], 
      expenses: expenses || [] 
    });
    setLoading(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData();
    }
  }, [isAuthenticated]);

  const handleExport = () => {
    const totalSharedExpenses = data.expenses
      .filter(e => e.item_type === 'shared')
      .reduce((sum, e) => sum + Number(e.amount), 0);
    const dividendPerShare = data.participants.length > 0 ? totalSharedExpenses / data.participants.length : 0;

    const exportData = data.participants.map(p => ({
      'Requester Name': p.user_name,
      'Email': p.user_email,
      'Phone': p.phone,
      'Beneficiary Name': p.beneficiary_name,
      'Animal Type': p.animals?.type || 'Unknown',
      'Share Price': p.animals?.price_per_share || 350,
      'Expense Dividend': dividendPerShare,
      'Total Due': (p.animals?.price_per_share || 350) + dividendPerShare,
      'Amount Paid': p.amount_paid,
      'Balance': (p.animals?.price_per_share || 350) + dividendPerShare - p.amount_paid,
      'Distribution': p.distribution_pref,
      'Date Booked': new Date(p.created_at).toLocaleDateString()
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Qurbani Manifest 2026");
    
    // Auto-size columns
    const max_widths = Object.keys(exportData[0] || {}).map(key => ({ wch: 20 }));
    worksheet["!cols"] = max_widths;

    XLSX.writeFile(workbook, `Qurbani_Manifest_2026_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen emerald-gradient flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl max-w-sm w-full text-center">
          <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Lock className="text-primary" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-primary mb-2">Admin Access</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Password"
              className="w-full bg-slate-50 border-2 border-transparent focus:border-emerald-100 p-4 rounded-2xl outline-none transition-all"
            />
            {error && <p className="text-red-500 text-xs font-bold">{error}</p>}
            <button className="w-full emerald-gradient text-white py-4 rounded-2xl font-bold hover:shadow-lg transition-shadow">
              Unlock Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  const totalBookedShares = data.participants.length;
  const totalSharedExpenses = data.expenses
    .filter(e => e.item_type === 'shared')
    .reduce((sum, e) => sum + Number(e.amount), 0);
  const dividendPerShare = totalBookedShares > 0 ? totalSharedExpenses / totalBookedShares : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-primary text-white p-6 shadow-lg sticky top-0 z-40">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 font-bold text-lg tracking-tight">
            <LayoutDashboard className="text-secondary" /> Qurbani Control Center
          </div>
          <button onClick={() => setIsAuthenticated(false)} className="text-xs uppercase tracking-widest text-emerald-100/60 flex items-center gap-2 hover:text-white transition-all"><LogOut size={14} /> Logout</button>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatCard icon={<Users className="text-primary" />} label="Total Booked Shares" value={totalBookedShares} />
          <StatCard icon={<Receipt className="text-amber-500" />} label="Shared Expenses" value={`$${totalSharedExpenses.toFixed(2)}`} />
          <StatCard icon={<DollarSign className="text-emerald-500" />} label="Dividend/Share" value={`$${dividendPerShare.toFixed(2)}`} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
              <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-primary tracking-tight">Participant Manifest</h2>
                <div className="flex gap-4">
                  <button onClick={handleExport} className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-100 transition-all shadow-sm"><Download size={14} /> Download Excel</button>
                  <button onClick={() => window.print()} className="flex items-center gap-2 bg-slate-50 text-slate-500 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-200"><Printer size={14} /> Print List</button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-widest font-black">
                      <th className="px-8 py-5">Family / Beneficiary</th>
                      <th className="px-6 py-5">Share</th>
                      <th className="px-6 py-5 text-right">Total Due</th>
                      <th className="px-6 py-5 text-right">Paid</th>
                      <th className="px-6 py-5 text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.participants.map((p: any) => {
                      const basePrice = p.animals?.price_per_share || 350;
                      const totalDue = basePrice + dividendPerShare;
                      const balance = totalDue - p.amount_paid;
                      return (
                        <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-4">
                            <div className="font-bold text-primary">{p.beneficiary_name}</div>
                            <div className="text-[10px] text-slate-400 font-medium">Req: {p.user_name} • {p.phone}</div>
                          </td>
                          <td className="px-6 py-4">
                             <span className="text-[10px] font-black px-3 py-1 bg-primary/5 text-primary rounded-lg uppercase tracking-tighter">{p.animals?.type}</span>
                          </td>
                          <td className="px-6 py-4 text-right font-medium text-slate-400 text-xs">${totalDue.toFixed(2)}</td>
                          <td className="px-6 py-4 text-right">
                             <input 
                                type="number"
                                defaultValue={p.amount_paid}
                                onBlur={async (e) => {
                                  await updateParticipantPayment(p.id, parseFloat(e.target.value));
                                  fetchAllData();
                                }}
                                className="w-20 text-right bg-transparent focus:bg-emerald-50 p-2 rounded-xl transition-all outline-none text-emerald-600 font-black text-sm"
                              />
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className={cn("text-sm font-black tracking-widest uppercase", balance <= 0 ? "text-emerald-500" : "text-red-500")}>
                              {balance <= 0 ? "PAID" : `$${balance.toFixed(2)}`}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <div className="space-y-8">
            <section className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
              <div className="flex items-center gap-3 mb-8">
                <Receipt className="text-secondary" />
                <h3 className="text-xl font-bold text-primary tracking-tight">Add Expense</h3>
              </div>
              <form action={async (fd) => { await addExpense(fd); fetchAllData(); }} className="space-y-4">
                <input name="description" required placeholder="Description (e.g. Transport)" className="w-full bg-slate-50 p-4 rounded-2xl outline-none focus:bg-white border-2 border-transparent focus:border-emerald-100 transition-all text-sm" />
                <input name="amount" type="number" step="0.01" required placeholder="Amount ($)" className="w-full bg-slate-50 p-4 rounded-2xl outline-none focus:bg-white border-2 border-transparent focus:border-emerald-100 transition-all text-sm font-bold" />
                <input type="hidden" name="itemType" value="shared" />
                <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95">Add Shared Expense</button>
              </form>

              <div className="mt-10 space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                {data.expenses.map(e => (
                  <div key={e.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center group hover:bg-white hover:border-emerald-100 transition-all">
                    <div>
                      <p className="font-bold text-primary text-xs mb-0.5">{e.description}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Shared Cost</p>
                    </div>
                    <div className="font-black text-slate-900 text-sm">${Number(e.amount).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: number | string }) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 flex items-center gap-6 group hover:scale-[1.02] transition-transform">
      <div className="w-16 h-16 rounded-[1.5rem] bg-slate-50 flex items-center justify-center text-primary group-hover:bg-emerald-50 transition-colors">{icon}</div>
      <div>
        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black mb-1">{label}</p>
        <p className="text-3xl font-black text-primary tracking-tighter">{value}</p>
      </div>
    </div>
  );
}
