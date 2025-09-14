'use client';

import type { Proposal } from '@/lib/types';
import useSWR from 'swr';
import { getProposalResults } from '@/lib/data';
import { CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Clock, ThumbsDown, ThumbsUp, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';


export function PastProposalCardContent({ proposal }: { proposal: Proposal }) {
  const isTwoOption =
    proposal.candidates.length === 2 &&
    proposal.candidates.some((c) => c.name.toLowerCase() === 'yes') &&
    proposal.candidates.some((c) => c.name.toLowerCase() === 'no');

  const { data: results, isLoading } = useSWR(
    proposal.status === 'closed' && isTwoOption ? proposal.id : null,
    getProposalResults,
    { revalidateOnFocus: false }
  );

  if (proposal.status === 'closed' && isTwoOption) {
    if (isLoading) {
      return (
        <CardContent className="flex-grow flex items-center justify-center min-h-[96px]">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      )
    }

    if (results) {
        const yesVotes = results.find(r => r.name.toLowerCase() === 'yes')?.votes || 0;
        const noVotes = results.find(r => r.name.toLowerCase() === 'no')?.votes || 0;
        const winner = yesVotes > noVotes ? 'Yes' : noVotes > yesVotes ? 'No' : 'Tie';
        
        return (
            <CardContent className="flex-grow flex flex-col items-center justify-center">
               <div className="flex items-center gap-2">
                 <div className={cn("flex h-12 w-12 items-center justify-center rounded-full", {
                    'bg-green-100 dark:bg-green-900/50': winner === 'Yes',
                    'bg-red-100 dark:bg-red-900/50': winner === 'No',
                    'bg-muted': winner === 'Tie',
                 })}>
                    {winner === 'Yes' && <ThumbsUp className="h-6 w-6 text-green-600 dark:text-green-400" />}
                    {winner === 'No' && <ThumbsDown className="h-6 w-6 text-red-600 dark:text-red-400" />}
                 </div>
                 <div>
                    <p className="text-sm text-muted-foreground">Result</p>
                    <p className="font-bold text-lg">{winner}</p>
                 </div>
               </div>
            </CardContent>
        )
    }
  }


  // Fallback for pending proposals or non-Yes/No closed proposals
  return (
    <>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground">
          {proposal.candidates.length} options
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Duration: {proposal.durationDays} days
        </p>
      </CardContent>
      <CardFooter>
        <Button asChild variant="secondary" className="w-full">
          <Link href={`/proposal/${proposal.id}`}>
            <Clock className="mr-2 h-4 w-4" />
            {proposal.status === 'closed' ? 'View Results' : 'View Proposal'}
          </Link>
        </Button>
      </CardFooter>
    </>
  );
}
