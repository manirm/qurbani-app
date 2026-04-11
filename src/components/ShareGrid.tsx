'use client';

import { motion } from 'framer-motion';
import { User, Users, CheckCircle2 } from 'lucide-react';
import type { AnimalStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ShareGridProps {
  animal: AnimalStatus;
  onJoin: (id: string) => void;
}

export default function ShareGrid({ animal, onJoin }: ShareGridProps) {
  const remaining = animal.total_shares - animal.filled_shares;
  const isFull = remaining <= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-3xl p-6 shadow-xl border border-secondary/10 flex flex-col h-full relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        {animal.total_shares > 1 ? <Users size={80} /> : <User size={80} />}
      </div>

      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary mb-1">
            {animal.identifier || 'New Group'}
          </div>
          <h3 className="text-2xl font-bold text-primary capitalize tracking-tight">
            {animal.type}
          </h3>
          <p className="text-sm text-foreground/60">
            {animal.total_shares} Shares total
          </p>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-secondary">
            ${animal.advance_price}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-foreground/40 font-semibold">
            Suggested Advance
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 md:grid-cols-7 gap-3 mb-8">
        {Array.from({ length: animal.total_shares }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "aspect-square rounded-full border-2 flex items-center justify-center transition-all duration-300",
              i < animal.filled_shares
                ? "bg-primary border-primary text-white shadow-md shadow-primary/20 scale-100"
                : "bg-background/50 border-dashed border-foreground/10 text-transparent scale-90"
            )}
          >
            {i < animal.filled_shares && <CheckCircle2 size={16} />}
          </div>
        ))}
      </div>

      <div className="mt-auto">
        <div className="flex justify-between items-center mb-4">
          <span className={cn(
            "text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest",
            isFull ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"
          )}>
            {isFull ? "Fully Booked" : `${remaining} Slots Available`}
          </span>
          {animal.actual_price && (
             <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-md">
                Price Finalized
             </span>
          )}
        </div>

        <button
          onClick={() => onJoin(animal.id)}
          disabled={isFull}
          className={cn(
            "w-full py-4 rounded-2xl font-bold transition-all duration-300",
            isFull
              ? "bg-foreground/5 text-foreground/30 cursor-not-allowed"
              : "emerald-gradient text-white hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98]"
          )}
        >
          {isFull ? "Group Full" : "Join This Group"}
        </button>
      </div>
    </motion.div>
  );
}
