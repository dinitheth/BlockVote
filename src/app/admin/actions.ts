'use server';

import { setupAnonymousVoting } from '@/ai/flows/anonymous-voting-assistance';
import { createProposal, updateProposalStatus } from '@/lib/data';
import { revalidatePath } from 'next/cache';

export async function createProposalAction(data: {
  title: string;
  description: string;
  candidates: { name: string }[];
  durationDays: number;
  creator?: string;
}) {
  try {
    const candidateNames = data.candidates.map((c) => c.name);

    if (candidateNames.length < 2) {
      return {
        success: false,
        error: 'Please provide at least two candidates.',
      };
    }

    const aiResponse = await setupAnonymousVoting({
      candidateOptions: candidateNames,
    });

    const result = await createProposal({ ...data, zkpConfiguration: aiResponse.zkpConfiguration });

    if (result.success) {
        revalidatePath('/');
        revalidatePath('/admin');
        revalidatePath('/profile');
        return { success: true, zkpConfiguration: aiResponse.zkpConfiguration };
    } else {
        return { success: false, error: result.message };
    }

  } catch (error: any) {
    console.error(error);
    return {
      success: false,
      error: error.message || 'Failed to create proposal. Please try again.',
    };
  }
}


export async function startProposalAction(proposalId: string) {
  try {
    const success = await updateProposalStatus(proposalId, 'active');
    if (success) {
      revalidatePath('/');
      revalidatePath('/admin');
      revalidatePath(`/proposal/${proposalId}`);
      revalidatePath('/profile');
      return { success: true, message: 'Proposal started successfully.' };
    }
    return { success: false, message: 'Failed to start proposal.' };
  } catch (error) {
     return { success: false, message: 'An error occurred.' };
  }
}

export async function stopProposalAction(proposalId: string) {
    try {
    const success = await updateProposalStatus(proposalId, 'closed');
    if (success) {
      revalidatePath('/');
      revalidatePath('/admin');
      revalidatePath(`/proposal/${proposalId}`);
      revalidatePath('/profile');
      return { success: true, message: 'Proposal stopped successfully.' };
    }
    return { success: false, message: 'Failed to stop proposal.' };
  } catch (error) {
     return { success: false, message: 'An error occurred.' };
  }
}
