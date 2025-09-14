import type { Proposal, Vote, ProposalResults } from './types';
import { getContract, getSigner } from './web3';
import { ethers } from 'ethers';

const mapStatus = (status: number): 'pending' | 'active' | 'closed' => {
  switch (status) {
    case 0:
      return 'pending';
    case 1:
      return 'active';
    case 2:
      return 'closed';
    default:
      return 'pending';
  }
};

export async function getProposals(): Promise<Proposal[]> {
  try {
    const contract = await getContract();
    const proposalCount = await contract.getProposalCount();
    const proposals: Proposal[] = [];

    for (let i = 0; i < proposalCount; i++) {
      const p = await contract.proposals(i);
      const candidatesRaw = await contract.getProposalCandidates(i);
      const candidates = candidatesRaw.map((c: any, index: number) => ({
        id: c.id.toString(),
        name: c.name,
        imageUrl: `https://picsum.photos/seed/${i}-${index}/400/400`,
        imageHint: 'professional portrait'
      }));

      proposals.push({
        id: p.id.toString(),
        title: p.title,
        description: p.description,
        status: mapStatus(Number(p.status)),
        candidates,
        durationDays: Number(p.durationDays),
        endDate: new Date(Number(p.endTime) * 1000).toISOString(),
        creator: p.creator,
        zkpConfiguration: p.zkpConfiguration
      });
    }

    // Sort by status: active, pending, then closed.
    return proposals.sort((a, b) => {
        if (a.status === 'active' && b.status !== 'active') return -1;
        if (a.status !== 'active' && b.status === 'active') return 1;
        if (a.status === 'pending' && b.status === 'closed') return -1;
        if (a.status === 'closed' && b.status === 'pending') return 1;
        return 0;
    });
  } catch (error) {
    console.error('Error fetching proposals:', error);
    return [];
  }
}

export async function getProposalById(id: string): Promise<Proposal | undefined> {
  try {
    const contract = await getContract();
    const p = await contract.proposals(id);
     if (p.id === 0n && p.title === "") {
      return undefined;
    }
    const candidatesRaw = await contract.getProposalCandidates(id);
    const candidates = candidatesRaw.map((c: any, index: number) => ({
        id: c.id.toString(),
        name: c.name,
        imageUrl: `https://picsum.photos/seed/${id}-${index}/400/400`,
        imageHint: 'professional portrait'
    }));

    return {
      id: p.id.toString(),
      title: p.title,
      description: p.description,
      status: mapStatus(Number(p.status)),
      candidates,
      durationDays: Number(p.durationDays),
      endDate: new Date(Number(p.endTime) * 1000).toISOString(),
      creator: p.creator,
      zkpConfiguration: p.zkpConfiguration
    };
  } catch (error) {
    console.error(`Error fetching proposal ${id}:`, error);
    return undefined;
  }
}

export async function createProposal(proposalData: {
  title: string;
  description: string;
  candidates: { name: string }[];
  durationDays: number;
  creator?: string;
  zkpConfiguration?: string;
}): Promise<{ success: boolean; message: string }> {
  try {
    const signer = await getSigner();
    if (!signer) throw new Error('Wallet not connected');
    const contract = await getContract(signer);

    const tx = await contract.createProposal(
      proposalData.title,
      proposalData.description,
      proposalData.candidates.map(c => c.name),
      proposalData.durationDays,
      proposalData.zkpConfiguration || ''
    );
    await tx.wait();
    return { success: true, message: 'Proposal created successfully!' };
  } catch (error: any) {
    console.error('Error creating proposal:', error);
    return { success: false, message: error.message || 'An unexpected error occurred.' };
  }
}


export async function castVote(vote: Vote): Promise<{ success: boolean; message: string }> {
  try {
    const signer = await getSigner();
    if (!signer) throw new Error('Wallet not connected');
    const contract = await getContract(signer);
    
    const tx = await contract.vote(vote.proposalId, vote.candidateId);
    await tx.wait();
    return { success: true, message: 'Your vote has been cast successfully!' };
  } catch (error: any) {
    console.error('Error casting vote:', error);
    if (error.reason) {
        return { success: false, message: `Transaction failed: ${error.reason}` };
    }
    return { success: false, message: 'An unexpected error occurred.' };
  }
}


export async function getProposalResults(proposalId: string): Promise<ProposalResults> {
  try {
    const contract = await getContract();
    const results = await contract.getProposalResults(proposalId);
    return results.map((r: any) => ({
      name: r.name,
      votes: Number(r.voteCount),
      candidateId: '', // Note: a candidateId isn't returned from this contract function
    }));
  } catch (error) {
    console.error(`Error fetching results for proposal ${proposalId}:`, error);
    return [];
  }
}


export async function hasVoted(proposalId: string, voterAddress: string): Promise<boolean> {
  try {
    const contract = await getContract();
    return await contract.hasVoted(proposalId, voterAddress);
  } catch (error) {
    console.error('Error checking vote status:', error);
    return false;
  }
}

export async function updateProposalStatus(
  id: string,
  status: 'active' | 'closed'
): Promise<boolean> {
  try {
    const signer = await getSigner();
    if (!signer) throw new Error('Wallet not connected');
    const contract = await getContract(signer);

    let tx;
    if (status === 'active') {
       const proposal = await getProposalById(id);
       if (!proposal) throw new Error('Proposal not found');
       tx = await contract.startProposal(id, proposal.durationDays);
    } else if (status === 'closed') {
      tx = await contract.closeProposal(id);
    } else {
      return false;
    }
    await tx.wait();
    return true;
  } catch (error) {
    console.error(`Error updating proposal ${id} status:`, error);
    return false;
  }
}

export async function cancelProposal(
  id: string,
  creatorAddress: string
): Promise<{ success: boolean; message: string }> {
   try {
    const signer = await getSigner();
    if (!signer) throw new Error('Wallet not connected');

    const connectedAddress = await signer.getAddress();
    if (connectedAddress.toLowerCase() !== creatorAddress.toLowerCase()) {
        return { success: false, message: 'You are not authorized to cancel this proposal.' };
    }

    const contract = await getContract(signer);
    
    const tx = await contract.cancelProposal(id);
    await tx.wait();
    
    return { success: true, message: 'Proposal cancelled successfully.' };
  } catch (error: any) {
    console.error(`Error cancelling proposal ${id}:`, error);
    if (error.reason) {
        return { success: false, message: `Transaction failed: ${error.reason}` };
    }
    return { success: false, message: 'An unexpected error occurred.' };
  }
}

// These functions from the old mock implementation are no longer needed
// but are kept here to avoid breaking other parts of the app that might
// still import them. They will be removed in a future step.
export async function getProposalCandidates(proposalId: string) {
    const proposal = await getProposalById(proposalId);
    return proposal ? proposal.candidates : [];
}
