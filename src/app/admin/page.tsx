import { createClient } from '@/utils/supabase/server';
import { LayoutDashboard, Users, UserCheck, CreditCard, Printer } from 'lucide-react';
import type { AnimalStatus, Participant } from '@/lib/types';

// Mock data for initial development/fallback
const MOCK_PARTICIPANTS: any[] = [
  { id: '1', user_name: 'Ahmed Khan', user_email: 'ahmed@example.com', animal_type: 'Cow', animal_id: '1', paid: true, distribution_pref: 'keep_all' },
  { id: '2', user_name: 'Fatima Ali', user_email: 'fatima@example.com', animal_type: 'Cow', animal_id: '1', paid: false, distribution_pref: 'donate_third' },
  { id: '3', user_name: 'Omar Farooq', user_email: 'omar@example.com', animal_type: 'Goat', animal_id: '3', paid: true, distribution_pref: 'donate_all' },
];

async function getAdminData() {
  try {
    const supabase = await createClient();
    
    const { data: animals } = await supabase.from('animal_status').select('*').order('type');
    const { data: participants } = await supabase.from('participants').select('*, animals(type)').order('created_at');
    
    return {
      animals: animals || [],
      participants: participants || []
    };
  } catch (e) {
    return { animals: [], participants: MOCK_PARTICIPANTS };
  }
}

export default async function AdminPage() {
  const { animals, participants } = await getAdminData();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Admin Nav */}
      <nav className="bg-primary text-white p-6 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="text-secondary" />
            <h1 className="text-xl font-bold tracking-tight">Qurbani Control Center</h1>
          </div>
          <div className="text-xs uppercase tracking-widest text-emerald-100/60 font-medium">
            Project Admin • v1.0
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatCard 
            icon={<Users className="text-primary" />} 
            label="Total Participants" 
            value={participants.length} 
          />
          <StatCard 
            icon={<UserCheck className="text-emerald-500" />} 
            label="Confirmed (Paid)" 
            value={participants.filter(p => p.paid).length} 
          />
          <StatCard 
            icon={<CreditCard className="text-amber-500" />} 
            label="Pending Payments" 
            value={participants.filter(p => !p.paid).length} 
          />
        </div>

        {/* Live Animal Status */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6 text-primary">
            <h2 className="text-2xl font-bold tracking-tight">Animal Group Progress</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {animals.length > 0 ? animals.map((animal) => (
              <div key={animal.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold text-primary">{animal.type} #{animal.id.slice(0, 4)}</span>
                  <span className="text-xs bg-slate-100 px-2 py-1 rounded-full font-bold">{animal.filled_shares}/{animal.total_shares}</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full emerald-gradient transition-all duration-1000" 
                    style={{ width: `${(animal.filled_shares / animal.total_shares) * 100}%` }}
                  />
                </div>
              </div>
            )) : (
              <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-3xl border border-dashed border-slate-300">
                Connect your Supabase database to see live progress.
              </div>
            )}
          </div>
        </section>

        {/* Participant Manifest */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-primary tracking-tight tracking-tight">Butcher's Manifest</h2>
            <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-bold text-primary hover:bg-slate-50 transition-colors">
              <Printer size={16} />
              Export to Print
            </button>
          </div>
          
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-widest font-bold">
                  <th className="px-8 py-5">Participant</th>
                  <th className="px-6 py-5">Contact</th>
                  <th className="px-6 py-5">Assignment</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5">Distribution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {participants.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-4 font-bold text-primary">{p.user_name}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{p.user_email}</td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold px-3 py-1 bg-primary/5 text-primary rounded-lg border border-primary/10">
                        {p.animals?.type || p.animal_type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {p.paid ? (
                        <span className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs">
                          <CheckCircle className="w-3.5 h-3.5" /> Paid
                        </span>
                      ) : (
                        <span className="text-amber-600 font-bold text-xs uppercase tracking-wider">Pending</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs italic text-slate-400 capitalize">
                      {p.distribution_pref.replace('_', ' ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: number | string }) {
  return (
    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 flex items-center gap-6">
      <div className="w-16 h-16 rounded-[1.5rem] bg-slate-50 flex items-center justify-center text-2xl">
        {icon}
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">{label}</p>
        <p className="text-3xl font-black text-primary">{value}</p>
      </div>
    </div>
  );
}

function CheckCircle(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
  );
}
