'use client';

import { useState, useTransition, useEffect } from 'react';
import type { Proposal, ProposalResults } from '@/lib/types';
import { usePrivy } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { castVoteAction } from './actions';
import Image from 'next/image';
import { Loader2, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { ResultsChart } from './results-chart';
import useSWR from 'swr';
import { getProposalResults, hasVoted as fetchHasVoted } from '@/lib/data';

export function VotingContainer({ proposal }: { proposal: Proposal }) {
  const { ready, authenticated, user, login } = usePrivy();
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(
    null
  );
  const [isPending, startTransition] = useTransition();
  const [voteResult, setVoteResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const voterAddress = user?.wallet?.address;

  const { data: hasVoted, mutate: revalidateHasVoted } = useSWR(
    voterAddress ? [proposal.id, voterAddress, 'hasVoted'] : null,
    ([proposalId, address]) => fetchHasVoted(proposalId, address)
  );
  
  const handleVote = () => {
    if (!selectedCandidate || !voterAddress) return;
    startTransition(async () => {
      const result = await castVoteAction(
        proposal.id,
        selectedCandidate,
        voterAddress
      );
      setVoteResult(result);
      if (result.success) {
        revalidateHasVoted();
      }
    });
  };

  if (hasVoted || (voteResult && voteResult.success)) {
    return (
      <ResultsContainer
        proposalId={proposal.id}
        title="Thank You for Voting!"
        subtitle="Here are the current results."
      />
    );
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Cast Your Vote</CardTitle>
          <CardDescription>
            Select one of the options below and submit your vote.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {proposal.candidates.map((candidate) => (
              <div
                key={candidate.id}
                onClick={() => setSelectedCandidate(candidate.id)}
                className={`cursor-pointer rounded-lg border-2 p-4 text-center transition-all ${
                  selectedCandidate === candidate.id
                    ? 'border-primary ring-2 ring-primary'
                    : 'border-border'
                }`}
              >
                <Image
                  src={candidate.imageUrl}
                  alt={candidate.name}
                  width={200}
                  height={200}
                  data-ai-hint={candidate.imageHint}
                  className="mx-auto h-32 w-32 rounded-full object-cover"
                />
                <h3 className="mt-4 font-semibold">{candidate.name}</h3>
              </div>
            ))}
          </div>
          {!ready && <div className="text-center">Initializing...</div>}
          {ready && !authenticated && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>You are not logged in</AlertTitle>
              <AlertDescription>
                <Button variant="link" className="p-0" onClick={login}>
                  Login to vote.
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {voteResult && (
             <Alert variant={voteResult.success ? 'default' : 'destructive'}>
                {voteResult.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <AlertTitle>{voteResult.success ? 'Success' : 'Error'}</AlertTitle>
                <AlertDescription>{voteResult.message}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleVote}
            disabled={!authenticated || !selectedCandidate || isPending}
            className="w-full"
            size="lg"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Vote
          </Button>
        </CardContent>
      </Card>
      <ResultsContainer proposalId={proposal.id} title="Live Results" />
    </div>
  );
}

export function ResultsContainer({
  proposalId,
  title,
  subtitle,
}: {
  proposalId: string;
  title: string;
  subtitle?: string;
}) {
  const { data: results, error } = useSWR(
    proposalId,
    getProposalResults,
    { refreshInterval: 5000 }
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">{title}</CardTitle>
        {subtitle && <CardDescription>{subtitle}</CardDescription>}
      </CardHeader>
      <CardContent>
        {!results && !error && (
            <div className="flex min-h-[300px] items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <p>Loading results...</p>
             </div>
        )}
        {error && <p>Failed to load results.</p>}
        {results && <ResultsChart data={results} />}
      </CardContent>
    </Card>
  );
}
