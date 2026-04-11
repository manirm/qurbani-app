'use client';

import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, UserCheck, CreditCard, Printer, 
  Plus, Receipt, DollarSign, Lock, LogOut, Download, PlusCircle, Scale, Wallet, Trash2, ArrowRight
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { addExpense, updateParticipantPayment, addAnimal, finalizeAnimalPrice, deleteAnimal, deleteExpense } from '@/app/actions';
import type { AnimalStatus, Participant, Expense, AnimalType } from '@/lib/types';
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
    const { data: animals } = await supabase.from('animal_status').select('*').order('identifier');
    const { data: participants } = await supabase.from('participants').select('*, animals(type, identifier, advance_price, actual_price)').order('created_at');
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

  const totalBookedShares = data.participants.length;
  // All expenses are shared across all total booked shares
  const totalCommunityExpenses = data.expenses
    .reduce((sum, e) => sum + Number(e.amount), 0);
  const dividendPerShare = totalBookedShares > 0 ? totalCommunityExpenses / totalBookedShares : 0;

  // Group participants by email for consolidated view
  const consolidated = data.participants.reduce((acc: any, p) => {
    const email = p.user_email.toLowerCase();
    if (!acc[email]) {
      acc[email] = {
        name: p.user_name,
        email: email,
        phone: p.phone,
        shares: [],
        totalPaid: 0,
        expenseCredits: 0
      };
    }
    acc[email].shares.push(p);
    acc[email].totalPaid += p.amount_paid;
    return acc;
  }, {});

  // Add expense credits to consolidated view
  data.expenses.forEach(e => {
    if (e.payer_id) {
      const payer = data.participants.find(p => p.id === e.payer_id);
      if (payer) {
        const email = payer.user_email.toLowerCase();
        if (consolidated[email]) {
          consolidated[email].expenseCredits += Number(e.amount);
        }
      }
    }
  });

  const handleExport = () => {
    const exportData = Object.values(consolidated).flatMap((c: any) => 
      c.shares.map((p: any) => {
        const basePrice = p.animals?.actual_price || p.animals?.advance_price || 500;
        const shareTotalCost = basePrice + dividendPerShare;
        return {
          'Requester': c.name,
          'Phone': c.phone,
          'Beneficiary': p.beneficiary_name,
          'Animal': p.animals?.identifier || 'TBD',
          'Share Price (Actual/Adv)': basePrice,
          'Shared Expense Div': dividendPerShare,
          'Total Cost': shareTotalCost,
          'Cash Paid': p.amount_paid,
          'Balance': shareTotalCost - p.amount_paid
        };
      })
    );

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Finance Manifest 2026");
    XLSX.writeFile(workbook, `Qurbani_Accounting_${new Date().toISOString().split('T')[0]}.xlsx`);
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
        {/* Top Management Bar */}
        <div className="flex flex-wrap gap-4 mb-12 items-center">
          <div className="flex gap-2">
            {(['Cow', 'Goat', 'Sheep'] as AnimalType[]).map(type => (
              <button 
                key={type}
                onClick={async () => { await addAnimal(type); fetchAllData(); }}
                className="bg-white border border-slate-200 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest text-primary hover:border-secondary transition-all flex items-center gap-2"
              >
                <PlusCircle size={14} className="text-secondary" /> Add {type}
              </button>
            ))}
          </div>
          <button onClick={handleExport} className="ml-auto bg-emerald-600 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg flex items-center gap-2">
            <Download size={16} /> Export ledger
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatCard icon={<Users className="text-primary" />} label="Total Booked Shares" value={totalBookedShares} />
          <StatCard icon={<Receipt className="text-amber-500" />} label="Total Expenses" value={`$${totalCommunityExpenses.toFixed(2)}`} />
          <StatCard icon={<Wallet className="text-emerald-500" />} label="Community Dividend" value={`$${dividendPerShare.toFixed(2)} / share`} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Manifest */}
          <div className="lg:col-span-3 space-y-8">
            <section className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
              <div className="p-8 border-b border-slate-50">
                <h2 className="text-2xl font-bold text-primary tracking-tight">Consolidated Finance Sheet</h2>
                <p className="text-xs text-slate-400 font-medium">Tracking all requests and individual credits</p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-widest font-black">
                      <th className="px-8 py-5">Requester / Summary</th>
                      <th className="px-6 py-5">Sub-Requests</th>
                      <th className="px-6 py-5 text-right">Total Cost</th>
                      <th className="px-6 py-5 text-right">Paid + Credits</th>
                      <th className="px-6 py-5 text-right">Final Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {Object.values(consolidated).map((c: any) => {
                      const totalCost = c.shares.reduce((sum: number, p: any) => {
                        const base = p.animals?.actual_price || p.animals?.advance_price || 500;
                        return sum + base + dividendPerShare;
                      }, 0);
                      const totalPaid = c.totalPaid + c.expenseCredits;
                      const balance = totalCost - totalPaid;

                      return (
                        <tr key={c.email} className="hover:bg-slate-50/50 transition-colors align-top">
                          <td className="px-8 py-6">
                            <div className="font-bold text-primary">{c.name}</div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{c.phone}</div>
                            {c.expenseCredits > 0 && (
                              <div className="mt-2 text-[9px] font-black text-emerald-600 bg-emerald-50 inline-block px-2 py-1 rounded-md uppercase tracking-wider">
                                Participant Expense Credit: ${c.expenseCredits.toFixed(2)}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-6">
                            <div className="space-y-4">
                              {c.shares.map((p: any) => (
                                <div key={p.id} className="text-[11px] bg-slate-50 p-3 rounded-xl border border-slate-100">
                                  <div className="font-bold text-primary">{p.beneficiary_name}</div>
                                  <div className="flex justify-between mt-1 text-slate-500">
                                    <span>{p.animals?.identifier} ({p.animals?.type})</span>
                                    <span className="font-black text-emerald-700">Cash Paid: 
                                      <input 
                                        type="number"
                                        defaultValue={p.amount_paid}
                                        onBlur={async (e) => {
                                          await updateParticipantPayment(p.id, parseFloat(e.target.value));
                                          fetchAllData();
                                        }}
                                        className="w-16 ml-1 bg-white border border-slate-200 text-right rounded px-1 outline-none focus:border-secondary"
                                      />
                                    </span>
                                  </div>
                                </div>
                              ))}
                              
                              {/* Participant Add Credit Quick Button */}
                              <form action={async (fd) => { fd.append('payerId', c.shares[0].id); await addExpense(fd); fetchAllData(); }} className="flex gap-2 items-center mt-2 p-2 bg-emerald-50 rounded-xl border border-emerald-100">
                                 <input name="description" required placeholder="Misc Item" className="w-full text-[10px] p-2 rounded-lg outline-none focus:ring-1 focus:ring-emerald-400" />
                                 <input name="amount" type="number" step="0.01" required placeholder="$ Amount" className="w-20 text-[10px] p-2 rounded-lg outline-none focus:ring-1 focus:ring-emerald-400 font-bold" />
                                 <input type="hidden" name="itemType" value="shared" />
                                 <button title="Apply as credit against their balance" className="bg-emerald-600 text-white p-2 rounded-lg hover:bg-emerald-700 transition-colors"><Plus size={12} /></button>
                              </form>
                            </div>
                          </td>
                          <td className="px-6 py-6 text-right font-black text-slate-400 text-sm italic">${totalCost.toFixed(2)}</td>
                          <td className="px-6 py-6 text-right font-black text-emerald-600 text-sm">${totalPaid.toFixed(2)}</td>
                          <td className="px-6 py-6 text-right">
                            <span className={cn("text-base font-black tracking-tighter", balance <= 1 ? "text-emerald-500" : "text-red-500 underline decoration-red-200")}>
                              {balance <= 1 ? "SETTLED" : `$${balance.toFixed(2)}`}
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

          {/* Right Column: Animal Pricing & Shared Expenses */}
          <div className="space-y-8">
            <section className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
              <div className="flex items-center gap-3 mb-8">
                <Scale className="text-secondary" />
                <h3 className="text-xl font-bold text-primary tracking-tight">Finalize Prices</h3>
              </div>
              <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                {data.animals.map(a => (
                  <div key={a.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-slate-300 transition-all">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary">{a.identifier}</span>
                      <div className="flex gap-2 items-center">
                        <span className="text-[10px] font-bold text-slate-400 italic">Shares: {a.filled_shares}/{a.total_shares}</span>
                        {a.filled_shares === 0 && (
                          <button onClick={async () => { await deleteAnimal(a.id); fetchAllData(); }} className="text-red-300 hover:text-red-600 transition-colors px-1" title="Delete Unused Animal">
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 items-center">
                      <div className="flex-1">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Actual Price Per Share</p>
                        <input 
                          type="number"
                          placeholder={`Est: $${a.advance_price}`}
                          defaultValue={a.actual_price || ''}
                          onBlur={async (e) => {
                            if (e.target.value) {
                              await finalizeAnimalPrice(a.id, parseFloat(e.target.value));
                              fetchAllData();
                            }
                          }}
                          className="w-full bg-white border border-slate-200 p-2 rounded-xl outline-none focus:border-secondary font-black text-primary text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
              <div className="flex items-center gap-3 mb-8">
                <Receipt className="text-secondary" />
              <h3 className="text-xl font-bold text-primary tracking-tight">Main Community Expenses</h3>
              </div>
              <form action={async (fd) => { await addExpense(fd); fetchAllData(); }} className="space-y-4 mb-6">
                <input name="description" required placeholder="Description (e.g. Slaughterhouse fee)" className="w-full bg-slate-50 p-4 rounded-2xl outline-none focus:bg-white border-2 border-transparent focus:border-emerald-100 transition-all text-sm" />
                <select name="payerId" className="w-full bg-slate-100 p-3 rounded-xl outline-none focus:bg-white border-2 border-transparent transition-all text-[11px] font-bold text-primary">
                  <option value="">Paid By: Community (Direct Fund)</option>
                  {data.participants.map(p => (
                    <option key={p.id} value={p.id}>Paid By: {p.user_name} ({p.beneficiary_name})</option>
                  ))}
                </select>
                <input name="amount" type="number" step="0.01" required placeholder="Amount ($)" className="w-full bg-slate-50 p-4 rounded-2xl outline-none focus:bg-white border-2 border-transparent focus:border-emerald-100 transition-all text-sm font-bold" />
                <input type="hidden" name="itemType" value="shared" />
                <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95">Log Expense</button>
              </form>
              
              <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest border-t border-slate-100 pt-6">Recent Expenses</p>

              <div className="mt-6 space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                {data.expenses.map(e => (
                  <div key={e.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-primary text-xs mb-0.5">{e.description}</p>
                      {e.payer_id && (
                        <p className="text-[8px] text-emerald-600 font-black uppercase tracking-widest">Participant Paid • Credit Applied</p>
                      )}
                    </div>
                    <div className="flex gap-4 items-center">
                      <div className="font-black text-slate-900 text-sm whitespace-nowrap">${Number(e.amount).toFixed(2)}</div>
                      <button onClick={async () => { await deleteExpense(e.id); fetchAllData(); }} className="text-red-300 hover:text-red-600 p-1" title="Delete Expense">
                        <Trash2 size={14} />
                      </button>
                    </div>
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
