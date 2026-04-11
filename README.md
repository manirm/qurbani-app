# 🕋 Qurbani Participation App

A community-focused web application built with **Next.js**, **Tailwind CSS**, and **Supabase** to organize and manage Qurbani (Udhiya) participation for Eid-ul-Adha. 

Inspired by the [Ramadan Iftar App](https://ifter-app.vercel.net), this tool manages the complexity of "shares" for larger animals and coordinates distribution preferences within the community.

## 🚀 Key Features

* **Share Management:** Real-time tracking of shares for large animals (7 shares for Cows/Camels).
* **Live Countdown:** Dynamic timer counting down to Eid-ul-Adha 2026.
* **Participant Manifest:** Admin dashboard with a "Butcher's List" for easy processing and labeling.
* **Distribution Tracking:** Options for participants to donate 1/3 or the entire share.
* **Real-time Updates:** Powered by Supabase to prevent over-booking of animal shares.

## 🛠 Tech Stack

* **Frontend:** Next.js 15 (App Router), Tailwind CSS (v4)
* **Backend/DB:** Supabase (PostgreSQL with RLS)
* **Design:** Emerald Green & Gold (Premium Islamic Aesthetic)
* **Deployment:** Vercel

## ⚙️ Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/manirm/qurbani-app.git
   cd qurbani-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Variables:**
   Create a `.env.local` file and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Database Schema:**
   Run the following SQL in your Supabase SQL Editor:
   ```sql
   -- 1. Animals Table
   CREATE TABLE animals (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     type TEXT NOT NULL,
     total_shares INTEGER NOT NULL,
     price_per_share DECIMAL NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- 2. Participants Table
   CREATE TABLE participants (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     animal_id UUID REFERENCES animals(id) ON DELETE CASCADE,
     user_name TEXT NOT NULL,
     user_email TEXT NOT NULL,
     shares_taken INTEGER DEFAULT 1,
     distribution_pref TEXT DEFAULT 'keep_all',
     paid BOOLEAN DEFAULT FALSE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- 3. Live Status View
   CREATE VIEW animal_status AS
   SELECT 
     a.id, 
     a.type, 
     a.total_shares,
     COALESCE(SUM(p.shares_taken), 0) as filled_shares
   FROM animals a
   LEFT JOIN participants p ON a.id = p.animal_id
   GROUP BY a.id, a.type, a.total_shares;
   ```

5. **Run the development server:**
   ```bash
   npm run dev
   ```

## 📋 Administration
Access the management dashboard at `/admin`. Here, organizers can:
* Monitor booking progress with real-time progress bars.
* Track payment status (Zelle/Cash).
* View and export the "Butcher's Manifest" for processing.
