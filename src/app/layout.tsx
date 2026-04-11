import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Compass, ShieldCheck, Heart, LayoutDashboard, Receipt, UserSearch } from "lucide-react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Community Qurbani 2026",
  description: "Organize and participate in shared Qurbani for Eid-ul-Adha.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50">
        <div className="flex-1">{children}</div>
        
        <footer className="bg-primary text-white pt-20 pb-12 relative overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-5 pointer-events-none" />
          
          <div className="container mx-auto px-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
              <div className="md:col-span-2">
                <div className="flex items-center gap-2 mb-6 text-2xl font-black tracking-tighter">
                  <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-primary">🕋</div>
                  Qurbani <span className="text-secondary">2026</span>
                </div>
                <p className="text-emerald-100/60 max-w-sm leading-relaxed font-medium">
                  A community-driven platform to manage and track sacrificial offerings for Eid-ul-Adha. Built for transparency, trust, and shared spiritual fulfillment.
                </p>
              </div>

              <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary mb-6">Navigation</h4>
                <ul className="space-y-4">
                  <li><Link href="/" className="text-sm font-bold text-emerald-100/80 hover:text-white transition-colors flex items-center gap-2"><Compass size={14} /> Home Dashboard</Link></li>
                  <li><Link href="/lookup" className="text-sm font-bold text-emerald-100/80 hover:text-white transition-colors flex items-center gap-2"><UserSearch size={14} /> My Bookings</Link></li>
                  <li><Link href="/expenses" className="text-sm font-bold text-emerald-100/80 hover:text-white transition-colors flex items-center gap-2"><Receipt size={14} /> Community Expenses</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary mb-6">Administration</h4>
                <ul className="space-y-4">
                  <li><Link href="/admin" className="text-sm font-bold text-emerald-100/80 hover:text-white transition-colors flex items-center gap-2 group"><LayoutDashboard size={14} className="group-hover:text-secondary transition-colors" /> Admin Portal</Link></li>
                  <li><div className="text-[10px] text-emerald-100/40 italic flex items-center gap-2 mt-4"><ShieldCheck size={12} /> Secure Access Required</div></li>
                </ul>
              </div>
            </div>

            <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
              <p className="text-[10px] text-emerald-100/30 uppercase tracking-widest font-black">© 2026 Community Qurbani Project • Built for the Ummah</p>
              <div className="flex items-center gap-2 text-secondary/40">
                <Heart size={14} fill="currentColor" />
                <span className="text-[10px] font-black uppercase tracking-widest italic">Barakah in Unity</span>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
