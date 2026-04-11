export type AnimalType = 'Cow' | 'Goat' | 'Sheep' | 'Camel';

export interface Animal {
  id: string;
  type: AnimalType;
  identifier: string; // e.g. "Cow-1"
  total_shares: number;
  advance_price: number;
  actual_price: number | null;
  tag_number: string | null;
}

export interface Participant {
  id: string;
  animal_id: string;
  user_name: string;
  user_email: string;
  phone: string;
  beneficiary_name: string;
  shares_taken: number;
  distribution_pref: 'keep_all' | 'donate_third' | 'donate_all';
  amount_paid: number;
  paid: boolean;
  created_at: string;
  // Joined animal data
  animals?: {
    type: AnimalType;
    identifier: string;
    advance_price: number;
    actual_price: number | null;
    tag_number: string | null;
  };
}

export interface AnimalStatus extends Animal {
  filled_shares: number;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  item_type: 'shared' | 'individual';
  payer_id: string | null;
  created_at: string;
}
