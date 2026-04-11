'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ShareGrid from '@/components/ShareGrid';
import JoinForm from '@/components/JoinForm';
import type { AnimalStatus } from '@/lib/types';
import { CheckCircle } from 'lucide-react';

interface ClientPageProps {
  initialAnimals: AnimalStatus[];
}

export default function ClientPage({ initialAnimals }: ClientPageProps) {
  const [selectedAnimalId, setSelectedAnimalId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleJoin = (id: string) => {
    setSelectedAnimalId(id);
  };

  const handleSuccess = () => {
    setSelectedAnimalId(null);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 5000);
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {initialAnimals.map((animal) => (
          <ShareGrid 
            key={animal.id} 
            animal={animal} 
            onJoin={handleJoin} 
          />
        ))}
      </div>

      <AnimatePresence>
        {selectedAnimalId && (
          <JoinForm 
            animalId={selectedAnimalId} 
            onClose={() => setSelectedAnimalId(null)}
            onSuccess={handleSuccess}
          />
        )}

        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] bg-emerald-600 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-400/30"
          >
            <CheckCircle className="text-emerald-200" />
            <div>
              <p className="font-bold">Booking Submitted!</p>
              <p className="text-xs text-emerald-100/80">Please check your email for payment instructions.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative background element */}
      <div className="mt-20 text-center opacity-10 select-none pointer-events-none">
        <h2 className="text-9xl font-bold text-primary">QURBANI</h2>
      </div>
    </div>
  );
}
