import EidCountdown from '@/components/EidCountdown';
import ClientPage from './client-page';
import { createClient } from '@/utils/supabase/server';
import type { AnimalStatus } from '@/lib/types';
import Link from 'next/link';
import { UserSearch, Receipt, ArrowRight } from 'lucide-react';

// Mock data for fallback
const MOCK_ANIMALS: AnimalStatus[] = [
  { id: '1', type: 'Cow', total_shares: 7, filled_shares: 4, price_per_share: 350 },
  { id: '2', type: 'Cow', total_shares: 7, filled_shares: 7, price_per_share: 350 },
  { id: '3', type: 'Goat', total_shares: 1, filled_shares: 0, price_per_share: 280 },
  { id: '4', type: 'Sheep', total_shares: 1, filled_shares: 1, price_per_share: 300 },
];

async function getAnimals(): Promise<AnimalStatus[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('animal_status')
      .select('*')
      .order('type');
    
    if (error || !data || data.length === 0) {
      return MOCK_ANIMALS;
    }
    return data as AnimalStatus[];
  } catch (e) {
    return MOCK_ANIMALS;
  }
}

export default async function Home() {
  const animals = await getAnimals();

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden emerald-gradient text-white">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-10 pointer-events-none" />
        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="mb-12">
            <h1 className="text-5xl md:text-8xl font-black mb-6 tracking-tighter">
              Community <span className="text-secondary tracking-normal">Qurbani</span> 2026
            </h1>
            <p className="text-xl md:text-2xl text-emerald-100/80 max-w-2xl mx-auto font-medium leading-relaxed mb-10">
              Transparent, organized, and shared with love. Join your community in fulfilling the sacred tradition.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                href="#booking"
                className="bg-secondary text-primary px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white transition-all shadow-xl active:scale-95"
              >
                Join Now
              </Link>
              <Link 
                href="/lookup"
                className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white/20 transition-all flex items-center gap-2"
              >
                <UserSearch size={18} /> My Bookings
              </Link>
              <Link 
                href="/expenses"
                className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white/20 transition-all flex items-center gap-2"
              >
                <Receipt size={18} /> Transparency
              </Link>
            </div>
          </div>
          
          <EidCountdown />
        </div>
      </section>

      {/* Main Content */}
      <section id="booking" className="container mx-auto px-6 -mt-20 pb-32">
        <div className="flex justify-between items-end mb-8 text-white md:text-primary">
          <div className="hidden md:block">
            <h2 className="text-3xl font-black tracking-tight">Available Groups</h2>
            <p className="text-sm text-slate-400 font-medium">Select a share to participate</p>
          </div>
        </div>
        <ClientPage initialAnimals={animals} />
      </section>

      {/* Trust Banner */}
      <section className="bg-white border-y border-slate-100 py-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center text-primary">
            <div>
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-emerald-600">
                <Receipt size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2 tracking-tight">Public Ledger</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Every expense is tracked and shared publicly for complete community confidence.</p>
            </div>
            <div>
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-emerald-600">
                <UserSearch size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2 tracking-tight">Self-Service Lookup</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Instantly verify your booking status and check your balance anytime.</p>
            </div>
            <div>
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-emerald-600">
                <ArrowRight size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2 tracking-tight">Easy Archival</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Full Excel reports for organizers to ensure smooth processing on the day of Eid.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
