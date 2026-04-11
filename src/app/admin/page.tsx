'use client';

import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, UserCheck, CreditCard, Printer, 
  Plus, Receipt, DollarSign, Lock, LogOut, ChevronRight
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { addExpense, updateParticipantPayment } from '@/app/actions';
import type { AnimalStatus, Participant, Expense } from '@/lib/types';
import { cn } from '@/lib/utils';

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

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchData = async () => {
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

    fetchData();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen emerald-gradient flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl max-w-sm w-full text-center">
          <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Lock className="text-primary" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-primary mb-2">Admin Access</h1>
          <p className="text-slate-500 text-sm mb-8">Enter the community password to access the treasurer dashboard.</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
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

  // Calculations
  const totalBookedShares = data.participants.length;
  const totalSharedExpenses = data.expenses
    .filter(e => e.item_type === 'shared')
    .reduce((sum, e) => sum + Number(e.amount), 0);
  
  const expensePerShare = totalBookedShares > 0 ? totalSharedExpenses / totalBookedShares : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-primary text-white p-6 shadow-lg sticky top-0 z-40">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="text-secondary" />
            <h1 className="text-xl font-bold tracking-tight">Qurbani Control Center</h1>
          </div>
          <button 
            onClick={() => setIsAuthenticated(false)}
            className="flex items-center gap-2 text-xs uppercase tracking-widest text-emerald-100/60 hover:text-white transition-colors"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatCard 
            icon={<Users className="text-primary" />} 
            label="Total Shares Booked" 
            value={totalBookedShares} 
          />
          <StatCard 
            icon={<Receipt className="text-amber-500" />} 
            label="Total Shared Expenses" 
            value={`$${totalSharedExpenses.toFixed(2)}`} 
          />
          <StatCard 
            icon={<DollarSign className="text-emerald-500" />} 
            label="Expense Per Share" 
            value={`$${expensePerShare.toFixed(2)}`} 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main List */}
          <div className="lg:col-span-2 space-y-12">
            <section>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-primary tracking-tight">Participant Manifest</h2>
                <div className="flex gap-2">
                  <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold text-primary hover:bg-slate-50 transition-colors">
                    <Printer size={14} /> Export
                  </button>
                </div>
              </div>
              
              <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-widest font-bold">
                        <th className="px-6 py-5">Participant & Beneficiary</th>
                        <th className="px-6 py-5">Assignment</th>
                        <th className="px-6 py-5 text-right">Total Due</th>
                        <th className="px-6 py-5 text-right">Paid</th>
                        <th className="px-6 py-5 text-right">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.participants.map((p: any) => {
                        const basePrice = p.animals?.price_per_share || 350;
                        const totalDue = basePrice + expensePerShare;
                        const balance = totalDue - p.amount_paid;
                        
                        return (
                          <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                            <td className="px-6 py-5">
                              <div className="font-bold text-primary">{p.user_name}</div>
                              <div className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">For: {p.beneficiary_name}</div>
                              <div className="text-[10px] text-slate-400">{p.phone}</div>
                            </td>
                            <td className="px-6 py-5">
                              <span className="text-[10px] font-bold px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 uppercase tracking-tighter">
                                {p.animals?.type}
                              </span>
                            </td>
                            <td className="px-6 py-5 text-right font-medium text-slate-600">${totalDue.toFixed(2)}</td>
                            <td className="px-6 py-5 text-right font-bold">
                              <input 
                                type="number"
                                defaultValue={p.amount_paid}
                                onBlur={(e) => updateParticipantPayment(p.id, parseFloat(e.target.value))}
                                className="w-20 text-right bg-transparent focus:bg-emerald-50 p-1 rounded transition-colors outline-none text-emerald-600 font-black"
                              />
                            </td>
                            <td className="px-6 py-5 text-right">
                              <span className={cn(
                                "font-black",
                                balance > 0 ? "text-red-500" : "text-emerald-500"
                              )}>
                                {balance <= 0 ? "PAID" : `$${balance.toFixed(2)}`}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar: Expenses */}
          <div className="space-y-8">
            <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
                  <Receipt size={20} />
                </div>
                <h3 className="text-xl font-bold text-primary tracking-tight">Add Expense</h3>
              </div>
              
              <form action={addExpense} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 px-1">Description</label>
                  <input 
                    name="description"
                    required
                    placeholder="e.g. Truck Rental"
                    className="w-full bg-slate-50 p-4 rounded-2xl outline-none focus:border-amber-100 border-2 border-transparent transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 px-1">Amount ($)</label>
                  <input 
                    name="amount"
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    className="w-full bg-slate-50 p-4 rounded-2xl outline-none focus:border-amber-100 border-2 border-transparent transition-all text-sm font-bold"
                  />
                </div>
                <input type="hidden" name="itemType" value="shared" />
                <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-sm tracking-tight hover:bg-black transition-colors flex items-center justify-center gap-2">
                  <Plus size={16} /> Add Shared Expense
                </button>
              </form>

              <hr className="my-8 border-slate-100" />

              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {data.expenses.map(e => (
                  <div key={e.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-amber-200 transition-colors">
                    <div>
                      <p className="font-bold text-primary text-sm leading-none mb-1">{e.description}</p>
                      <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">Shared • {new Date(e.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="font-black text-slate-900 text-sm">
                      ${Number(e.amount).toFixed(2)}
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
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 flex items-center gap-6 group hover:border-emerald-100 transition-colors">
      <div className="w-16 h-16 rounded-[1.5rem] bg-slate-50 flex items-center justify-center text-2xl group-hover:bg-emerald-50 transition-colors">
        {icon}
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">{label}</p>
        <p className="text-3xl font-black text-primary tracking-tight">{value}</p>
      </div>
    </div>
  );
}
