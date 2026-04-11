'use client';

import { useFormStatus } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, CreditCard, Heart } from 'lucide-react';
import { joinGroup } from '@/app/actions';
import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface JoinFormProps {
  animalId: string;
  onClose: () => void;
  onSuccess: () => void;
}

function SubmitButton() {
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
          Confirm Booking
        </>
      )}
    </button>
  );
}

export default function JoinForm({ animalId, onClose, onSuccess }: JoinFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    const result = await joinGroup(formData);
    if (result.success) {
      onSuccess();
    } else if (result.error) {
      setError(result.error);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-card w-full max-w-lg rounded-[2.5rem] shadow-2xl relative overflow-hidden p-8 border border-secondary/20"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-foreground/5 text-foreground/40 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-primary mb-2 tracking-tight">Reserve Share</h2>
          <p className="text-foreground/60 text-sm">Please provide your details to confirm your participation.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        <form action={handleSubmit} ref={formRef} className="space-y-6">
          <input type="hidden" name="animalId" value={animalId} />
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-secondary uppercase tracking-widest mb-2 ml-1">Full Name</label>
              <input
                required
                name="name"
                className="w-full bg-foreground/5 border-2 border-transparent focus:border-secondary/30 focus:bg-white p-4 rounded-2xl outline-none transition-all duration-300"
                placeholder="Ex. Ahmed Khan"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-secondary uppercase tracking-widest mb-2 ml-1">Email Address</label>
              <input
                required
                type="email"
                name="email"
                className="w-full bg-foreground/5 border-2 border-transparent focus:border-secondary/30 focus:bg-white p-4 rounded-2xl outline-none transition-all duration-300"
                placeholder="ahmed@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-secondary uppercase tracking-widest mb-2 ml-1 flex items-center gap-2">
                <Heart size={12} className="text-secondary" />
                Distribution Preference
              </label>
              <select
                name="distribution"
                className="w-full bg-foreground/5 border-2 border-transparent focus:border-secondary/30 focus:bg-white p-4 rounded-2xl outline-none appearance-none transition-all duration-300"
              >
                <option value="keep_all">Keep All (Traditional 1/3 splits)</option>
                <option value="donate_third">Donate 1/3 to the Needy</option>
                <option value="donate_all">Donate Entire Share</option>
              </select>
            </div>
          </div>

          <div className="p-6 bg-secondary/5 rounded-[2rem] border border-secondary/10">
            <div className="flex items-start gap-3">
              <CreditCard className="text-secondary mt-1 shrink-0" size={20} />
              <div>
                <h4 className="text-sm font-bold text-primary mb-1 tracking-tight">Payment Information</h4>
                <p className="text-[12px] text-foreground/50 leading-relaxed">
                  After joining, please send your payment via **Zelle** to: <br/>
                  <span className="text-secondary font-mono font-bold font-sm">payment@communityqurbani.org</span> <br/>
                  Payment must be received within 24 hours to confirm your spot.
                </p>
              </div>
            </div>
          </div>

          <SubmitButton />
        </form>
      </motion.div>
    </div>
  );
}
