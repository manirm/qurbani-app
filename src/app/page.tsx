import EidCountdown from '@/components/EidCountdown';
import ClientPage from './client-page';
import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import type { AnimalStatus } from '@/lib/types';
import Link from 'next/link';
import { UserSearch, Receipt, ArrowRight } from 'lucide-react';
import { naturalSort } from '@/lib/utils';

// Mock data for fallback
const MOCK_ANIMALS: AnimalStatus[] = [
  { id: '1', type: 'Cow', identifier: 'Cow-1', total_shares: 7, filled_shares: 4, advance_price: 500, actual_price: null, tag_number: null },
  { id: '2', type: 'Cow', identifier: 'Cow-2', total_shares: 7, filled_shares: 7, advance_price: 500, actual_price: null, tag_number: null },
  { id: '3', type: 'Goat', identifier: 'Goat-1', total_shares: 1, filled_shares: 0, advance_price: 550, actual_price: null, tag_number: null },
  { id: '4', type: 'Sheep', identifier: 'Sheep-1', total_shares: 1, filled_shares: 1, advance_price: 400, actual_price: null, tag_number: null },
];

async function getAnimals(): Promise<AnimalStatus[]> {
  try {
    const q = query(collection(db, 'animals'), orderBy('identifier'));
    const snap = await getDocs(q);
    
    if (snap.empty) {
      return naturalSort(MOCK_ANIMALS, a => a.identifier);
    }
    
    const data = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as AnimalStatus[];

    return naturalSort(data, a => a.identifier);
  } catch (e) {
    console.error('Error fetching animals:', e);
    return naturalSort(MOCK_ANIMALS, a => a.identifier);
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

      {/* Payment Info Banner */}
      <section className="bg-secondary/5 py-16 border-t border-slate-100">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto bg-white rounded-[3rem] p-8 md:p-12 shadow-xl border border-secondary/10 flex flex-col md:flex-row items-center gap-8">
            <div className="w-20 h-20 bg-secondary/10 rounded-3xl flex items-center justify-center text-secondary shrink-0">
              <Receipt size={40} />
            </div>
            <div className="grow text-center md:text-left">
              <h3 className="text-2xl font-black text-primary mb-2 tracking-tight">Deposit Information</h3>
              <p className="text-slate-500 font-medium mb-6">To confirm your booking, please send the total advance to our community treasurer.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary mb-3">Deposit Recipient</p>
                  <p className="text-lg font-bold text-primary">Br. Mustafizur Rahman</p>
                </div>
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary mb-3">Payment Methods</p>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-primary">Paypal: <span className="text-secondary font-black">309-868-4330</span></p>
                    <p className="text-sm font-bold text-primary">Zelle: <span className="text-secondary font-black">mustafizur@yahoo.com</span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
