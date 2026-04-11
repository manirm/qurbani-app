'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function joinGroup(formData: FormData) {
  const supabase = await createClient();
  
  const animalId = formData.get('animalId') as string;
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const distribution = formData.get('distribution') as string;
  
  // Support for multiple beneficiaries
  const beneficiaries = formData.getAll('beneficiary') as string[];

  // 1. Check current capacity
  const { data: status, error: statusError } = await supabase
    .from('animal_status')
    .select('*')
    .eq('id', animalId)
    .single();

  if (statusError || !status) {
    return { error: 'Could not find the animal group.' };
  }

  const requestedShares = beneficiaries.length;
  if (status.filled_shares + requestedShares > status.total_shares) {
    return { error: `Not enough slots! Only ${status.total_shares - status.filled_shares} shares remaining.` };
  }

  // 2. Insert participants batch
  const participantsToInsert = beneficiaries.map(beneficiary => ({
    animal_id: animalId,
    user_name: name,
    user_email: email,
    phone: phone,
    beneficiary_name: beneficiary,
    distribution_pref: distribution,
    shares_taken: 1,
  }));

  const { error: insertError } = await supabase
    .from('participants')
    .insert(participantsToInsert);

  if (insertError) {
    console.error('Insert error:', insertError);
    return { error: 'Failed to join the group. Please try again.' };
  }

  revalidatePath('/');
  revalidatePath('/admin');
  revalidatePath('/lookup');
  
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
  revalidatePath('/expenses');
  return { success: true };
}

export async function updateParticipantPayment(participantId: string, amount: number) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('participants')
    .update({ amount_paid: amount, paid: amount > 0 })
    .eq('id', participantId);

  if (error) return { error: error.message };
  
  revalidatePath('/admin');
  revalidatePath('/lookup');
  return { success: true };
}
