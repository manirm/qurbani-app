'use client';

import { useState } from 'react';
import { Search, User, Mail, Phone, Calculator, CheckCircle, Clock } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function LookupPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setIsSearching(true);
    setSearched(true);
    
    const supabase = createClient();
    
    // 1. Fetch participants (Search by email or phone)
    const { data: participants } = await supabase
      .from('participants')
      .select('*, animals(type, price_per_share)')
      .or(`user_email.eq.${query.toLowerCase()},phone.eq.${query}`);
    
    // 2. Fetch shared expenses for individual dividend calculation
    const { data: allExpenses } = await supabase.from('expenses').select('*');
    const { data: allParticipants } = await supabase.from('participants').select('id');
    
    const totalSharedExpenses = (allExpenses || [])
      .filter(e => e.item_type === 'shared')
      .reduce((sum, e) => sum + Number(e.amount), 0);
    const totalSharesCount = allParticipants?.length || 0;
    const dividendPerShare = totalSharesCount > 0 ? totalSharedExpenses / totalSharesCount : 0;

    setResults(participants || []);
    setExpenses([{ id: 'dividend', amount: dividendPerShare }]);
    setIsSearching(false);
  };

  const dividendPerShare = expenses[0]?.amount || 0;

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="emerald-gradient text-white pt-24 pb-40 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-10 pointer-events-none" />
        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter">My Bookings</h1>
            <p className="text-emerald-100/70 text-lg max-w-xl mx-auto font-medium mb-12">
              Enter your email or phone number to check your Qurbani status and balance due.
            </p>

            <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative group">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="email@example.com or 309-XXX-XXXX"
                className="w-full bg-white/10 backdrop-blur-xl border-2 border-white/20 focus:border-secondary/50 p-6 rounded-[2rem] outline-none text-xl transition-all placeholder:text-white/30 text-white shadow-2xl"
              />
              <button 
                type="submit"
                disabled={isSearching}
                className="absolute right-3 top-3 bottom-3 aspect-square bg-secondary text-primary rounded-2xl flex items-center justify-center hover:bg-white transition-all active:scale-95 shadow-lg"
              >
                {isSearching ? <span className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /> : <Search size={24} />}
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-6 -mt-20 pb-20">
        <AnimatePresence mode="wait">
          {searched && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {results.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    {results.map((p) => {
                      const basePrice = p.animals?.price_per_share || 350;
                      const totalDue = basePrice + dividendPerShare;
                      const balance = totalDue - p.amount_paid;
                      
                      return (
                        <div key={p.id} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col md:flex-row gap-8 relative overflow-hidden group">
                          <div className={cn(
                            "absolute top-0 right-0 px-6 py-2 rounded-bl-3xl text-[10px] font-black uppercase tracking-widest",
                            p.paid ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
                          )}>
                            {p.paid ? 'Confirmed' : 'Pending Payment'}
                          </div>
                          
                          <div className="grow">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-3 bg-slate-50 rounded-2xl text-primary">
                                <User size={24} />
                              </div>
                              <div>
                                <h3 className="text-xl font-bold text-primary leading-none mb-1">{p.beneficiary_name}</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Reserved by {p.user_name}</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Assignment</p>
                                <p className="font-bold text-primary">{p.animals?.type} Share</p>
                              </div>
                              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Distribution</p>
                                <p className="font-bold text-primary capitalize">{p.distribution_pref.replace('_', ' ')}</p>
                              </div>
                            </div>
                          </div>

                          <div className="md:w-64 flex flex-col justify-center border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-8">
                            <div className="space-y-2 mb-4">
                              <div className="flex justify-between text-xs text-slate-400">
                                <span>Share Price:</span>
                                <span>${basePrice.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-xs text-slate-400">
                                <span>Dividend Share:</span>
                                <span>${dividendPerShare.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-xs text-slate-600 font-bold">
                                <span>Total Due:</span>
                                <span>${totalDue.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-xs text-emerald-600 font-bold">
                                <span>Paid:</span>
                                <span>${p.amount_paid.toFixed(2)}</span>
                              </div>
                            </div>
                            <div className={cn(
                              "text-center py-3 rounded-2xl font-black text-sm tracking-widest uppercase",
                              balance <= 0 ? "bg-emerald-600 text-white" : "bg-red-50 text-red-600 border border-red-100"
                            )}>
                              {balance <= 0 ? 'Fully Paid' : `Balance Due: $${balance.toFixed(2)}`}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="space-y-6">
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-secondary/20">
                      <div className="flex items-center gap-2 mb-6 text-primary">
                        <Calculator className="text-secondary" />
                        <h3 className="text-xl font-bold tracking-tight">Summary</h3>
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between font-medium text-slate-500">
                          <span>Total Shares</span>
                          <span className="text-primary font-bold">{results.length}</span>
                        </div>
                        <div className="flex justify-between font-black text-2xl text-primary pt-4 border-t border-slate-100">
                          <span>Total Balance</span>
                          <span className="text-red-500">${results.reduce((s, p) => s + (p.animals?.price_per_share + dividendPerShare - p.amount_paid), 0).toFixed(2)}</span>
                        </div>
                        <div className="pt-6">
                           <div className="p-4 bg-secondary/5 rounded-2xl border border-secondary/10 flex gap-3 italic text-[11px] text-slate-500 leading-relaxed font-medium">
                            <Clock size={16} className="text-secondary shrink-0 mt-0.5" />
                            <p>Payments are updated manually by the treasurer. If you just paid, please allow up to 24 hours for reflecting.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-20 rounded-[3rem] shadow-xl border border-slate-100 text-center max-w-2xl mx-auto">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="text-slate-300" size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-primary mb-2">No bookings found</h3>
                  <p className="text-slate-400 max-w-sm mx-auto">We couldn't find any reservations for <strong>{query}</strong>. Please check the spelling or try your phone number.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
