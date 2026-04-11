'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import type { AnimalType } from '@/lib/types';

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

export async function addAnimal(type: AnimalType) {
  const supabase = await createClient();
  
  // 1. Get current count for this type to auto-number
  const { count } = await supabase
    .from('animals')
    .select('*', { count: 'exact', head: true })
    .eq('type', type);

  const nextNumber = (count || 0) + 1;
  const identifier = `${type}-${nextNumber}`;

  // 2. Set default suggested advance prices
  const defaults: Record<AnimalType, { shares: number, advance: number }> = {
    'Cow': { shares: 7, advance: 500 },
    'Goat': { shares: 1, advance: 550 },
    'Sheep': { shares: 1, advance: 400 },
    'Camel': { shares: 7, advance: 600 }
  };

  const { error } = await supabase
    .from('animals')
    .insert([{
      type,
      identifier,
      total_shares: defaults[type].shares,
      advance_price: defaults[type].advance,
      actual_price: null, // TBD
      price_per_share: defaults[type].advance // For backward DB compatibility
    }]);

  if (error) return { error: error.message };
  
  revalidatePath('/');
  revalidatePath('/admin');
  return { success: true };
}

export async function finalizeAnimalPrice(animalId: string, actualPrice: number) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('animals')
    .update({ actual_price: actualPrice })
    .eq('id', animalId);

  if (error) return { error: error.message };
  
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
  const payerId = formData.get('payerId') as string | null;

  const { error } = await supabase
    .from('expenses')
    .insert([{ 
      description, 
      amount, 
      item_type: itemType,
      payer_id: payerId === "" ? null : payerId
    }]);

  if (error) return { error: error.message };
  
  revalidatePath('/admin');
  revalidatePath('/expenses');
  revalidatePath('/lookup');
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

export async function deleteAnimal(animalId: string) {
  const supabase = await createClient();
  
  // Only allow deleting if no shares are taken (for safety)
  const { data: status } = await supabase.from('animal_status').select('filled_shares').eq('id', animalId).single();
  if (status && status.filled_shares > 0) {
    return { error: 'Cannot delete: This animal has active participants.' };
  }

  const { error } = await supabase.from('animals').delete().eq('id', animalId);
  if (error) return { error: error.message };
  
  revalidatePath('/');
  revalidatePath('/admin');
  return { success: true };
}

export async function deleteExpense(expenseId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('expenses').delete().eq('id', expenseId);
  if (error) return { error: error.message };
  
  revalidatePath('/admin');
  revalidatePath('/expenses');
  return { success: true };
}
