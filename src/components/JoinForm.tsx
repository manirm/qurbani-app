'use client';

import { useFormStatus } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, CreditCard, Heart, Phone, UserPlus, Trash2, PlusCircle, AlertCircle } from 'lucide-react';
import { joinGroup } from '@/app/actions';
import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface JoinFormProps {
  animalId: string;
  advancePrice: number;
  onClose: () => void;
  onSuccess: () => void;
}

function SubmitButton({ shareCount, advancePrice }: { shareCount: number, advancePrice: number }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "w-full emerald-gradient text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]",
        pending ? "opacity-70 cursor-not-allowed" : "hover:shadow-lg shadow-primary/20"
      )}
    >
      {pending ? (
        <span className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        <>
          <Send size={18} />
          Pay ${shareCount * advancePrice} Advance & Book
        </>
      )}
    </button>
  );
}

export default function JoinForm({ animalId, advancePrice, onClose, onSuccess }: JoinFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [beneficiaries, setBeneficiaries] = useState<string[]>(['']);

  const addBeneficiary = () => setBeneficiaries([...beneficiaries, '']);
  const removeBeneficiary = (index: number) => {
    if (beneficiaries.length > 1) {
      setBeneficiaries(beneficiaries.filter((_, i) => i !== index));
    }
  };

  async function handleSubmit(formData: FormData) {
    const result = await joinGroup(formData);
    if (result.success) {
      onSuccess();
    } else if (result.error) {
      setError(result.error);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-card w-full max-w-lg rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] border border-secondary/20"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-foreground/5 text-foreground/40 transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="p-8 pb-4 shrink-0">
          <h2 className="text-3xl font-bold text-primary mb-2 tracking-tight">Reserve Shares</h2>
          <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-100">
            <AlertCircle size={16} />
            <p className="text-[10px] font-bold uppercase tracking-widest leading-normal">
              Final price TBD based on farm weight. You are paying an estimated advance of <strong>${advancePrice} per share</strong> today.
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          <form action={handleSubmit} ref={formRef} className="space-y-6">
            <input type="hidden" name="animalId" value={animalId} />
            
            <div className="space-y-6">
              <section className="space-y-4">
                <h3 className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-2 px-1">Your Information</h3>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                  <input
                    required
                    name="name"
                    className="w-full bg-foreground/5 border-2 border-transparent focus:border-secondary/30 focus:bg-white p-4 rounded-2xl outline-none transition-all duration-300"
                    placeholder="Requester's name"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Email</label>
                    <input
                      required
                      type="email"
                      name="email"
                      className="w-full bg-foreground/5 border-2 border-transparent focus:border-secondary/30 focus:bg-white p-4 rounded-2xl outline-none transition-all duration-300"
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Phone</label>
                    <input
                      required
                      name="phone"
                      className="w-full bg-foreground/5 border-2 border-transparent focus:border-secondary/30 focus:bg-white p-4 rounded-2xl outline-none transition-all duration-300"
                      placeholder="309-XXX-XXXX"
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <h3 className="text-[10px] font-black text-secondary uppercase tracking-[0.2em]">Shares & Beneficiaries</h3>
                  <button 
                    type="button"
                    onClick={addBeneficiary}
                    className="flex items-center gap-1.5 text-secondary hover:text-primary transition-colors text-[10px] font-black uppercase tracking-widest"
                  >
                    <PlusCircle size={14} /> Add Another
                  </button>
                </div>

                <AnimatePresence mode="popLayout">
                  {beneficiaries.map((_, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="flex gap-2 items-center group"
                    >
                      <div className="relative flex-1">
                        <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-1 ml-1">Share {index + 1} for:</label>
                        <input
                          required
                          name="beneficiary"
                          className="w-full bg-foreground/5 border-2 border-transparent focus:border-secondary/30 focus:bg-white p-4 rounded-2xl outline-none transition-all duration-300 text-sm"
                          placeholder="Name & Father's Name"
                        />
                      </div>
                      {beneficiaries.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeBeneficiary(index)}
                          className="mt-6 p-3 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </section>

              <section>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Meat Distribution</label>
                <select
                  name="distribution"
                  className="w-full bg-foreground/5 border-2 border-transparent focus:border-secondary/30 focus:bg-white p-4 rounded-2xl outline-none appearance-none transition-all duration-300 cursor-pointer text-sm"
                >
                  <option value="keep_all">Keep All (Traditional 1/3 splits)</option>
                  <option value="donate_third">Donate 1/3 to the Needy</option>
                  <option value="donate_all">Donate Entire Share</option>
                </select>
              </section>
            </div>

            <div className="p-5 bg-secondary/5 rounded-[2.5rem] border border-secondary/10">
              <div className="flex items-start gap-4">
                <CreditCard className="text-secondary mt-1 shrink-0" size={24} />
                <div>
                  <h4 className="text-sm font-bold text-primary mb-1 tracking-tight">Deposit Recipient: Br. Mustafizur Rahman</h4>
                  <p className="text-[11px] text-foreground/50 leading-relaxed font-medium">
                    Please send total advance for **{beneficiaries.length} shares**:<br/>
                    Paypal: <span className="text-primary font-black">309-868-4330</span> • 
                    Zelle: <span className="text-primary font-black ml-1">mustafizur@yahoo.com</span>
                  </p>
                </div>
              </div>
            </div>

            <SubmitButton shareCount={beneficiaries.length} advancePrice={advancePrice} />
          </form>
        </div>
      </motion.div>
    </div>
  );
}
