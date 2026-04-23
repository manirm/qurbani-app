'use client';

import { useState } from 'react';
import { Search, User, Mail, Phone, Calculator, CheckCircle, Clock, Pencil, Trash2, AlertCircle, Loader2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore';
import { deleteParticipant } from '@/app/actions';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import EditBookingForm from '@/components/EditBookingForm';
import type { Participant } from '@/lib/types';

export default function LookupPage() {
  const [queryStr, setQueryStr] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [isWithdrawing, setIsWithdrawing] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryStr) return;
    setIsSearching(true);
    setSearched(true);
    
    try {
      const qLower = queryStr.toLowerCase().trim();
      // Search by any word in the query
      const searchWord = qLower.split(' ')[0];

      // 1. Fetch participants using searchTerms array
      const partQuery = query(
        collection(db, 'participants'), 
        where('searchTerms', 'array-contains', searchWord)
      );
      const partSnap = await getDocs(partQuery);
      
      const participantDocs = partSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      // 2. Fetch animal data for these participants
      const animalIds = Array.from(new Set(participantDocs.map((p: any) => p.animal_id)));
      const animalMap: Record<string, any> = {};
      
      await Promise.all(animalIds.map(async (id) => {
        const aSnap = await getDoc(doc(db, 'animals', id));
        if (aSnap.exists()) {
          animalMap[id] = aSnap.data();
        }
      }));

      // Join data and refine with client-side filtering for multi-word queries
      const joinedResults = participantDocs.map((p: any) => ({
        ...p,
        animals: animalMap[p.animal_id]
      })).filter((p: any) => {
        const fullText = `${p.user_name} ${p.user_email} ${p.phone} ${p.beneficiary_name} ${p.father_name}`.toLowerCase();
        return fullText.includes(qLower);
      });

      // 3. Fetch all expenses for community dividends
      const expSnap = await getDocs(collection(db, 'expenses'));
      const allExpenses = expSnap.docs.map(d => d.data());
      
      const participantsSnap = await getDocs(collection(db, 'participants'));
      const totalSharesCount = participantsSnap.size;
      
      const totalCommunityExpenses = allExpenses
        .reduce((sum, e) => sum + Number(e.amount), 0);
      const dividendPerShare = totalSharesCount > 0 ? totalCommunityExpenses / totalSharesCount : 0;

      // 4. Calculate expense credits for the searched user
      const userResultIds = joinedResults.map(p => p.id);
      const userExpenseCredits = allExpenses
        .filter((e: any) => e.payer_id && userResultIds.includes(e.payer_id))
        .reduce((sum, e) => sum + Number(e.amount), 0);

      setResults(joinedResults);
      setExpenses([{ id: 'dividend', amount: dividendPerShare, userCredits: userExpenseCredits }]);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const dividendPerShare = expenses[0]?.amount || 0;
  const userExpenseCredits = expenses[0]?.userCredits || 0;

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
                value={queryStr}
                onChange={(e) => setQueryStr(e.target.value)}
                placeholder="Name, Email, or Phone (e.g. Manir, 309-XXX...)"
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
                      const basePrice = p.animals?.actual_price || p.animals?.advance_price || 500;
                      const totalDue = basePrice + dividendPerShare;
                      // Note: expense credits are calculated globally for the user in the summary
                      const balance = totalDue - p.amount_paid;
                      
                      return (
                        <div key={p.id} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col md:flex-row gap-8 relative overflow-hidden group">
                          <div className={cn(
                            "absolute top-0 right-0 px-6 py-2 rounded-bl-3xl text-[10px] font-black uppercase tracking-widest",
                            p.paid ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
                          )}>
                            {p.animals?.actual_price ? 'Price Finalized' : 'Estimate Only'}
                          </div>
                          
                          <div className="grow">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-3 bg-slate-50 rounded-2xl text-primary">
                                <User size={24} />
                              </div>
                              <div>
                                <h3 className="text-xl font-bold text-primary leading-none mb-1">
                                  {p.beneficiary_name} {p.father_name && <span className="text-xs text-slate-400 font-normal ml-1">(S/o {p.father_name})</span>}
                                </h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Reserved for {p.animals?.identifier || p.animals?.type}</p>
                              </div>
                            </div>

                            <div className="absolute top-4 right-20 flex gap-2">
                               <button 
                                 onClick={() => setEditingParticipant(p)}
                                 className="p-3 bg-slate-50 text-slate-400 hover:text-secondary hover:bg-white rounded-2xl transition-all shadow-sm border border-slate-100"
                                 title="Edit Booking"
                               >
                                 <Pencil size={16} />
                               </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Base Share Price</p>
                                <p className="font-bold text-primary">${basePrice.toFixed(2)}</p>
                              </div>
                              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Community Expense Share</p>
                                <p className="font-bold text-primary">${dividendPerShare.toFixed(2)}</p>
                              </div>
                            </div>
                          </div>

                          <div className="md:w-64 flex flex-col justify-center border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-8">
                            <div className="space-y-2 mb-4">
                              <div className="flex justify-between text-xs text-slate-600 font-bold">
                                <span>Share Total:</span>
                                <span>${totalDue.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-xs text-emerald-600 font-bold">
                                <span>Cash Paid:</span>
                                <span>${p.amount_paid.toFixed(2)}</span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className={cn(
                                "text-center py-3 rounded-2xl font-black text-sm tracking-widest uppercase",
                                balance <= 0 ? "bg-emerald-600 text-white" : "bg-red-50 text-red-600 border border-red-100"
                              )}>
                                {balance <= 0 ? 'Fully Paid' : `Balance: $${balance.toFixed(2)}`}
                              </div>
                              {p.amount_paid === 0 && (
                                <button
                                  disabled={!!isWithdrawing}
                                  onClick={async () => {
                                    if (confirm('Are you sure you want to withdraw this share? This action cannot be undone.')) {
                                      setIsWithdrawing(p.id);
                                      const result = await deleteParticipant(p.id);
                                      if (result.success) {
                                        setResults(prev => prev.filter(item => item.id !== p.id));
                                        setStatusMessage({ type: 'success', text: 'Share withdrawn successfully.' });
                                      } else {
                                        setStatusMessage({ type: 'error', text: result.error || 'Withdrawal failed.' });
                                      }
                                      setIsWithdrawing(null);
                                      setTimeout(() => setStatusMessage(null), 5000);
                                    }
                                  }}
                                  className="w-full text-center py-2 text-[10px] uppercase tracking-widest font-bold text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center justify-center gap-2"
                                >
                                  {isWithdrawing === p.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                                  Withdraw Share
                                </button>
                              )}
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
                        <h3 className="text-xl font-bold tracking-tight">Consolidated Account</h3>
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between font-medium text-slate-500">
                          <span>Total Shares</span>
                          <span className="text-primary font-bold">{results.length}</span>
                        </div>
                        {userExpenseCredits > 0 && (
                          <div className="flex justify-between font-medium text-emerald-600">
                            <span>Expense Credits</span>
                            <span className="font-bold">-${userExpenseCredits.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-black text-2xl text-primary pt-4 border-t border-slate-100">
                          <span>Overall Due</span>
                          <span className="text-red-500">
                            ${Math.max(0, results.reduce((s, p) => {
                               const base = p.animals?.actual_price || p.animals?.advance_price || 500;
                               return s + (base + dividendPerShare - p.amount_paid);
                            }, 0) - userExpenseCredits).toFixed(2)}
                          </span>
                        </div>
                        <div className="pt-6">
                           <div className="p-4 bg-secondary/5 rounded-2xl border border-secondary/10 flex gap-3 italic text-[11px] text-slate-500 leading-relaxed font-medium">
                            <Clock size={16} className="text-secondary shrink-0 mt-0.5" />
                            <p>Final prices are finalized by admin after slaughter. Participant-paid expenses are credited automatically to your overall account balance.</p>
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
                  <p className="text-slate-400 max-w-sm mx-auto">Check if you used a different email or phone. If you just registered, your details will appear here shortly.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {editingParticipant && (
          <EditBookingForm 
            participant={editingParticipant}
            onClose={() => setEditingParticipant(null)}
            onSuccess={() => {
              setEditingParticipant(null);
              handleSearch({ preventDefault: () => {} } as any);
              setStatusMessage({ type: 'success', text: 'Booking updated successfully.' });
              setTimeout(() => setStatusMessage(null), 5000);
            }}
          />
        )}

        {statusMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={cn(
               "fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border",
               statusMessage.type === 'success' ? "bg-emerald-600 text-white border-emerald-400/30" : "bg-red-600 text-white border-red-400/30"
            )}
          >
            {statusMessage.type === 'success' ? <CheckCircle className="text-emerald-200" /> : <AlertCircle className="text-red-200" />}
            <p className="font-bold">{statusMessage.text}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
