'use server';

import { castVote } from '@/lib/data';
import { revalidatePath } from 'next/cache';

export async function castVoteAction(
  proposalId: string,
  candidateId: string,
  voterAddress: string
) {
  try {
    const result = await castVote({ proposalId, candidateId, voterAddress });
    if (result.success) {
      revalidatePath(`/proposal/${proposalId}`);
    }
    return result;
  } catch (error) {
    console.error('Error casting vote:', error);
    return { success: false, message: 'An unexpected error occurred.' };
  }
}
