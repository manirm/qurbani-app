'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function joinGroup(formData: FormData) {
  const supabase = await createClient();
  
  const animalId = formData.get('animalId') as string;
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const beneficiary = formData.get('beneficiary') as string;
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
        phone: phone,
        beneficiary_name: beneficiary,
        distribution_pref: distribution,
        shares_taken: 1,
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

export async function addExpense(formData: FormData) {
  const supabase = await createClient();
  const description = formData.get('description') as string;
  const amount = parseFloat(formData.get('amount') as string);
  const itemType = formData.get('itemType') as string;

  const { error } = await supabase
    .from('expenses')
    .insert([{ description, amount, item_type: itemType }]);

  if (error) return { error: error.message };
  
  revalidatePath('/admin');
  return { success: true };
}

export async function updateParticipantPayment(participantId: string, amount: number) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('participants')
    .update({ amount_paid: amount, paid: amount > 0 }) // Simple logic for paid status
    .eq('id', participantId);

  if (error) return { error: error.message };
  
  revalidatePath('/admin');
  return { success: true };
}
