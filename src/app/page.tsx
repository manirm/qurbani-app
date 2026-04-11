import EidCountdown from '@/components/EidCountdown';
import ClientPage from './client-page';
import { createClient } from '@/utils/supabase/server';
import type { AnimalStatus } from '@/lib/types';


// Mock data for initial development/fallback
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
          <div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
              Community <span className="text-secondary tracking-wide">Qurbani</span> 2026
            </h1>
            <p className="text-xl md:text-2xl text-emerald-100/80 max-w-2xl mx-auto font-light leading-relaxed">
              Join your community in fulfilling the sacred tradition. 
              Transparent, organized, and shared with love.
            </p>
          </div>
          
          <EidCountdown />
        </div>
      </section>


      {/* Main Content */}
      <section className="container mx-auto px-6 -mt-20 pb-20">
        <ClientPage initialAnimals={animals} />
      </section>


      {/* Footer */}
      <footer className="py-12 bg-primary text-emerald-100/40 border-t border-white/5">
        <div className="container mx-auto px-6 text-center text-sm">
          <p>© 2026 Community Qurbani Project • Built for the Ummah</p>
        </div>
      </footer>
    </main>
  );
}


// Simple wrapper to handle server/client transition for animations
function motion_wrapper({ children }: { children: React.ReactNode }) {
  return children; // Motion will be handled in child components
}
