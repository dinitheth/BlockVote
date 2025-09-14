export type Candidate = {
  id: string;
  name: string;
  imageUrl: string;
  imageHint: string;
};

export type Proposal = {
  id: string;
  title: string;
  description: string;
  candidates: Candidate[];
  status: 'pending' | 'active' | 'closed';
  zkpConfiguration?: string;
  creator?: string;
  durationDays: number;
  endDate?: string;
};

export type Vote = {
  proposalId: string;
  candidateId: string;
  voterAddress: string;
};

export type ProposalResults = {
  candidateId: string;
  name: string;
  votes: number;
}[];
