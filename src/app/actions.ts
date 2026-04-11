'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function joinGroup(formData: FormData) {
  const supabase = await createClient();
  
  const animalId = formData.get('animalId') as string;
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const distribution = formData.get('distribution') as string;

  // 1. Check current capacity
  const { data: status, error: statusError } = await supabase
    .from('animal_status')
    .select('*')
    .eq('id', animalId)
    .single();

  if (statusError || !status) {
    return { error: 'Could not find the animal group.' };
  }

  if (status.filled_shares >= status.total_shares) {
    return { error: 'This animal is already full!' };
  }

  // 2. Insert participant
  const { error: insertError } = await supabase
    .from('participants')
    .insert([
      {
        animal_id: animalId,
        user_name: name,
        user_email: email,
        distribution_pref: distribution,
        shares_taken: 1, // Defaulting to 1 for simplicity, can be expanded
      },
    ]);

  if (insertError) {
    console.error('Insert error:', insertError);
    return { error: 'Failed to join the group. Please try again.' };
  }

  revalidatePath('/');
  revalidatePath('/admin');
  
  return { success: true };
}
