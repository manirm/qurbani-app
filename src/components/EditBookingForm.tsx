'use client';

import { motion } from 'framer-motion';
import { X, Save, User, Mail, Phone, Heart, Info } from 'lucide-react';
import { updateParticipantDetails } from '@/app/actions';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { Participant } from '@/lib/types';

interface EditBookingFormProps {
  participant: Participant;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditBookingForm({ participant, onClose, onSuccess }: EditBookingFormProps) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      user_name: formData.get('name') as string,
      user_email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      beneficiary_name: formData.get('beneficiary') as string,
      father_name: formData.get('fatherName') as string,
      distribution_pref: formData.get('distribution') as string,
    };

    const result = await updateParticipantDetails(participant.id, data);
    
    if (result.success) {
      onSuccess();
    } else {
      setError(result.error || 'Failed to update booking');
      setIsPending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] border border-secondary/20"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="p-8 pb-4 shrink-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-secondary/10 rounded-xl text-secondary">
               <User size={20} />
            </div>
            <h2 className="text-2xl font-bold text-primary tracking-tight">Edit Booking</h2>
          </div>
          <p className="text-xs text-slate-400 font-medium">Update the details for this sacrificial share.</p>
        </div>

        <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-[11px] font-bold flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <section className="space-y-4">
              <h3 className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-2 px-1">Requester Information</h3>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Full Name</label>
                <input
                  required
                  name="name"
                  defaultValue={participant.user_name}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-secondary/30 focus:bg-white p-4 rounded-2xl outline-none transition-all duration-300 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Email</label>
                  <input
                    required
                    type="email"
                    name="email"
                    defaultValue={participant.user_email}
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-secondary/30 focus:bg-white p-4 rounded-2xl outline-none transition-all duration-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Phone</label>
                  <input
                    required
                    name="phone"
                    defaultValue={participant.phone}
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-secondary/30 focus:bg-white p-4 rounded-2xl outline-none transition-all duration-300 text-sm"
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4">
               <h3 className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-2 px-1">Beneficiary Details</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Beneficiary Name</label>
                    <input
                      required
                      name="beneficiary"
                      defaultValue={participant.beneficiary_name}
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-secondary/30 focus:bg-white p-4 rounded-2xl outline-none transition-all duration-300 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Father's Name</label>
                    <input
                      required
                      name="fatherName"
                      defaultValue={participant.father_name || ''}
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-secondary/30 focus:bg-white p-4 rounded-2xl outline-none transition-all duration-300 text-sm"
                    />
                  </div>
               </div>
            </section>

            <section>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Meat Distribution</label>
              <select
                name="distribution"
                defaultValue={participant.distribution_pref}
                className="w-full bg-slate-50 border-2 border-transparent focus:border-secondary/30 focus:bg-white p-4 rounded-2xl outline-none appearance-none transition-all duration-300 cursor-pointer text-sm"
              >
                <option value="keep_all">Keep All (Traditional 1/3 splits)</option>
                <option value="donate_third">Donate 1/3 to the Needy</option>
                <option value="donate_all">Donate Entire Share</option>
              </select>
            </section>

            <button
              type="submit"
              disabled={isPending}
              className={cn(
                "w-full emerald-gradient text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]",
                isPending ? "opacity-70 cursor-not-allowed" : "hover:shadow-lg shadow-primary/20"
              )}
            >
              {isPending ? (
                <span className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save size={18} />
                  Save Changes
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
