'use server';

import { cancelProposal as cancelProposalData } from '@/lib/data';
import { revalidatePath } from 'next/cache';

export async function cancelProposalAction(proposalId: string, creatorAddress: string) {
  try {
    const result = await cancelProposalData(proposalId, creatorAddress);
    if (result.success) {
      revalidatePath('/profile');
      revalidatePath('/');
      revalidatePath('/admin');
    }
    return result;
  } catch (error) {
    console.error('Error cancelling proposal:', error);
    return { success: false, message: 'An unexpected error occurred.' };
  }
}
