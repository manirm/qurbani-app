export type AnimalType = 'Cow' | 'Goat' | 'Sheep' | 'Camel';

export interface Animal {
  id: string;
  type: AnimalType;
  total_shares: number;
  price_per_share: number;
}

export interface Participant {
  id: string;
  animal_id: string;
  user_name: string;
  user_email: string;
  shares_taken: number;
  distribution_pref: 'keep_all' | 'donate_third' | 'donate_all';
  paid: boolean;
  created_at: string;
}

export interface AnimalStatus extends Animal {
  filled_shares: number;
}
