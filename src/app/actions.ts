'use server';

import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  runTransaction,
  serverTimestamp,
  orderBy,
  increment,
  writeBatch
} from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import type { AnimalType } from '@/lib/types';

/**
 * Helper to generate search terms for broad search in Firestore
 */
function generateSearchTerms(data: any): string[] {
  const terms = new Set<string>();
  const addTerms = (str: string) => {
    if (!str) return;
    const s = str.toLowerCase().trim();
    // Words and parts
    const words = s.split(/[\s@.-]+/);
    words.forEach(word => {
      if (word.length >= 2) terms.add(word);
    });
    // Prefix search terms (first 10 chars)
    for (let i = 2; i <= Math.min(s.length, 10); i++) {
      terms.add(s.substring(0, i));
    }
    // Full string
    terms.add(s);
  };
  
  addTerms(data.user_name);
  addTerms(data.user_email);
  addTerms(data.phone);
  addTerms(data.beneficiary_name);
  if (data.father_name) addTerms(data.father_name);
  
  return Array.from(terms);
}

export async function joinGroup(formData: FormData) {
  const animalId = formData.get('animalId') as string;
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const distribution = formData.get('distribution') as string;
  
  const names = formData.getAll('beneficiary') as string[];
  const fatherNames = formData.getAll('fatherName') as string[];

  const beneficiaries = names.map((name, i) => ({
    name,
    fatherName: fatherNames[i] || ''
  }));

  try {
    const requestedShares = beneficiaries.length;

    await runTransaction(db, async (transaction) => {
      const animalRef = doc(db, 'animals', animalId);
      const animalSnap = await transaction.get(animalRef);

      if (!animalSnap.exists()) {
        throw new Error('Could not find the animal group.');
      }

      const animalData = animalSnap.data();
      const filledShares = animalData.filled_shares || 0;
      const totalShares = animalData.total_shares;

      if (filledShares + requestedShares > totalShares) {
        throw new Error(`Not enough slots! Only ${totalShares - filledShares} shares remaining.`);
      }

      // Add participants
      for (const b of beneficiaries) {
        const participantData = {
          animal_id: animalId,
          user_name: name,
          user_email: email,
          phone: phone,
          beneficiary_name: b.name,
          father_name: b.fatherName,
          distribution_pref: distribution,
          shares_taken: 1,
          amount_paid: 0,
          paid: false,
          created_at: new Date().toISOString(),
          searchTerms: generateSearchTerms({
            user_name: name,
            user_email: email,
            phone: phone,
            beneficiary_name: b.name,
            father_name: b.fatherName
          })
        };
        const newPartRef = doc(collection(db, 'participants'));
        transaction.set(newPartRef, participantData);
      }

      // Update animal capacity
      transaction.update(animalRef, {
        filled_shares: increment(requestedShares)
      });
    });

    revalidatePath('/');
    revalidatePath('/admin');
    revalidatePath('/lookup');
    
    return { success: true };
  } catch (error: any) {
    console.error('Join error:', error);
    return { error: error.message || 'Failed to join the group. Please try again.' };
  }
}

export async function addAnimal(type: AnimalType) {
  try {
    // Get count for identifier
    const q = query(collection(db, 'animals'), where('type', '==', type));
    const snap = await getDocs(q);
    const nextNumber = snap.size + 1;
    const identifier = `${type}-${nextNumber}`;

    const defaults: Record<AnimalType, { shares: number, advance: number }> = {
      'Cow': { shares: 7, advance: 500 },
      'Goat': { shares: 1, advance: 550 },
      'Sheep': { shares: 1, advance: 400 },
      'Camel': { shares: 7, advance: 600 }
    };

    await addDoc(collection(db, 'animals'), {
      type,
      identifier,
      total_shares: defaults[type].shares,
      filled_shares: 0,
      advance_price: defaults[type].advance,
      actual_price: null,
      tag_number: null,
      created_at: new Date().toISOString()
    });

    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function finalizeAnimalPrice(animalId: string, actualPrice: number) {
  try {
    const animalRef = doc(db, 'animals', animalId);
    await updateDoc(animalRef, { actual_price: actualPrice });

    revalidatePath('/');
    revalidatePath('/admin');
    revalidatePath('/lookup');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updateAnimalTag(animalId: string, tagNumber: string) {
  try {
    const animalRef = doc(db, 'animals', animalId);
    await updateDoc(animalRef, { tag_number: tagNumber });

    revalidatePath('/admin');
    revalidatePath('/lookup');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function addExpense(formData: FormData) {
  const description = formData.get('description') as string;
  const amount = parseFloat(formData.get('amount') as string);
  const itemType = formData.get('itemType') as string;
  const payerId = formData.get('payerId') as string | null;

  try {
    await addDoc(collection(db, 'expenses'), {
      description,
      amount,
      item_type: itemType,
      payer_id: payerId === "" ? null : payerId,
      created_at: new Date().toISOString()
    });

    revalidatePath('/admin');
    revalidatePath('/expenses');
    revalidatePath('/lookup');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updateParticipantPayment(participantId: string, amount: number) {
  try {
    const partRef = doc(db, 'participants', participantId);
    await updateDoc(partRef, { 
      amount_paid: amount, 
      paid: amount > 0 
    });

    revalidatePath('/admin');
    revalidatePath('/lookup');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteAnimal(animalId: string) {
  try {
    const animalRef = doc(db, 'animals', animalId);
    const animalSnap = await getDoc(animalRef);
    
    if (animalSnap.exists() && (animalSnap.data().filled_shares || 0) > 0) {
      return { error: 'Cannot delete: This animal has active participants.' };
    }

    await deleteDoc(animalRef);
    
    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteExpense(expenseId: string) {
  try {
    await deleteDoc(doc(db, 'expenses', expenseId));
    revalidatePath('/admin');
    revalidatePath('/expenses');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteParticipant(participantId: string, force: boolean = false) {
  try {
    const partRef = doc(db, 'participants', participantId);
    const partSnap = await getDoc(partRef);

    if (!partSnap.exists()) return { error: 'Participant not found' };
    const pData = partSnap.data();

    if (!force && (pData.amount_paid || 0) > 0) {
      return { error: 'Cannot withdraw: This share has a recorded payment. Please contact admin to process refund first.' };
    }

    await runTransaction(db, async (transaction) => {
      const animalRef = doc(db, 'animals', pData.animal_id);
      transaction.delete(partRef);
      transaction.update(animalRef, {
        filled_shares: increment(-1)
      });
    });

    revalidatePath('/');
    revalidatePath('/admin');
    revalidatePath('/lookup');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updateParticipantDetails(participantId: string, data: any) {
  try {
    const partRef = doc(db, 'participants', participantId);
    const updateData = {
      user_name: data.user_name,
      user_email: data.user_email,
      phone: data.phone,
      beneficiary_name: data.beneficiary_name,
      father_name: data.father_name,
      distribution_pref: data.distribution_pref,
      searchTerms: generateSearchTerms(data)
    };
    
    await updateDoc(partRef, updateData);

    revalidatePath('/admin');
    revalidatePath('/lookup');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
