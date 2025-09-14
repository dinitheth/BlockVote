'use client';

import type { Proposal } from '@/lib/types';
import { usePrivy } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown, Vote, Loader2, Clock } from 'lucide-react';
import Link from 'next/link';
import { useState, useTransition, useEffect } from 'react';
import { castVoteAction } from '@/app/election/[id]/actions';
import { Alert, AlertDescription } from '@/components/ui/alert';
import useSWR from 'swr';
import { hasVoted as fetchHasVoted, getProposalResults } from '@/lib/data';
import { useRouter } from 'next/navigation';
import { Progress } from '@/components/ui/progress';

function Countdown({ endDate }: { endDate: string }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const end = new Date(endDate);
      const diff = end.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft('Voting ended');
        clearInterval(interval);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);

      setTimeLeft(`${days}d ${hours}h ${minutes}m left`);
    }, 1000);

    return () => clearInterval(interval);
  }, [endDate]);

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Clock className="h-4 w-4" />
      {timeLeft}
    </div>
  );
}


function ResultsDisplay({ proposalId }: { proposalId: string }) {
  const { data: results } = useSWR(proposalId, getProposalResults, {
    refreshInterval: 2000,
  });

  if (!results || results.length < 2) {
    return (
      <div className="w-full h-10 bg-muted animate-pulse rounded-md" />
    );
  }

  // Handle cases with more than 2 candidates gracefully for results
  const yesOption = results.find(r => r.name.toLowerCase() === 'yes');
  const noOption = results.find(r => r.name.toLowerCase() === 'no');

  const yesVotes = yesOption ? yesOption.votes : (results[0]?.votes || 0);
  const noVotes = noOption ? noOption.votes : (results[1]?.votes || 0);
  
  const totalVotes = results.reduce((acc, r) => acc + r.votes, 0);
  const yesPercentage = totalVotes > 0 ? (yesVotes / totalVotes) * 100 : 0;
  const noPercentage = totalVotes > 0 ? (noVotes / totalVotes) * 100 : 0;

  return (
    <div className="w-full space-y-2">
      <div className="relative h-6 w-full rounded-full bg-muted overflow-hidden border border-border">
         <div 
            className="h-full bg-primary"
            style={{ width: `${yesPercentage}%`}}
         />
      </div>
      <div className="flex justify-between text-sm font-medium">
        <span className="text-green-600 dark:text-green-500">Yes: {Math.round(yesPercentage)}% ({yesVotes})</span>
        <span className="text-red-600 dark:text-red-500">No: {Math.round(noPercentage)}% ({noVotes})</span>
      </div>
    </div>
  );
}

export function ProposalCardActions({ proposal }: { proposal: Proposal }) {
  const { ready, authenticated, user, login } = usePrivy();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const voterAddress = user?.wallet?.address;

  const { data: hasVoted, mutate: revalidateHasVoted } = useSWR(
    voterAddress ? [proposal.id, voterAddress, 'hasVoted'] : null,
    ([proposalId, address]) => fetchHasVoted(proposalId, address)
  );

  const handleVote = (candidateId: string) => {
    if (!voterAddress) {
      login();
      return;
    }
    startTransition(async () => {
      const result = await castVoteAction(proposal.id, candidateId, voterAddress);
      if (result.success) {
        revalidateHasVoted();
      } else {
        setError(result.message);
      }
    });
  };

  if (!ready) {
    return <div className="w-full h-10 bg-muted animate-pulse rounded-md" />;
  }

  const isTwoOption = proposal.candidates.length === 2;

  if (voterAddress && hasVoted) {
     return (
        <div className="w-full space-y-4">
            {proposal.endDate && <Countdown endDate={proposal.endDate} />}
            {isTwoOption && <ResultsDisplay proposalId={proposal.id} />}
            <Button asChild className="w-full" variant="secondary">
                <Link href={`/proposal/${proposal.id}`}>
                    <Vote className="mr-2 h-4 w-4" /> Voted! View Results
                </Link>
            </Button>
        </div>
     )
  }

  if (isTwoOption) {
    const yesCandidate = proposal.candidates.find(c => c.name.toLowerCase() === 'yes') || proposal.candidates[0];
    const noCandidate = proposal.candidates.find(c => c.name.toLowerCase() === 'no') || proposal.candidates[1];

    return (
      <div className="w-full space-y-4">
        {proposal.endDate && <Countdown endDate={proposal.endDate} />}
        <ResultsDisplay proposalId={proposal.id} />
        {error && (
            <Alert variant="destructive" className="mb-2">
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}
        <div className="flex w-full gap-2">
          <Button
            className="w-1/2"
            variant="success"
            onClick={() => handleVote(yesCandidate.id)}
            disabled={isPending}
          >
            {isPending ? <Loader2 className="animate-spin" /> : <ThumbsUp />}
            Yes
          </Button>
          <Button
            className="w-1/2"
            variant="destructive"
            onClick={() => handleVote(noCandidate.id)}
            disabled={isPending}
          >
            {isPending ? <Loader2 className="animate-spin" />: <ThumbsDown />}
            No
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button asChild className="w-full">
      <Link href={`/proposal/${proposal.id}`}>
        <Vote className="mr-2 h-4 w-4" /> View & Vote
      </Link>
    </Button>
  );
}
