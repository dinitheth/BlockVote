
'use client';

import { usePrivy } from '@privy-io/react-auth';
import useSWR from 'swr';
import { getProposals } from '@/lib/data';
import type { Proposal } from '@/lib/types';
import { Header } from '@/components/header';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PastProposalCardContent } from '../past-proposal-card-content';
import { ProposalCardActions } from '../proposal-card-actions';
import { useTransition } from 'react';
import { cancelProposalAction } from './actions';
import { toast } from '@/hooks/use-toast';
import { XCircle } from 'lucide-react';

function ProposalList({
  title,
  proposals,
  onAction,
}: {
  title: string;
  proposals: Proposal[];
  onAction: () => void;
}) {
  const { user } = usePrivy();
  const [isPending, startTransition] = useTransition();

  const handleCancel = (proposalId: string) => {
    if (!user?.wallet?.address) return;
    startTransition(async () => {
      const result = await cancelProposalAction(proposalId, user.wallet!.address);
      if (result.success) {
        toast({
          title: 'Success',
          description: result.message,
        });
        onAction(); // Revalidate data
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.message,
        });
      }
    });
  };


  if (proposals.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="font-headline text-2xl font-bold tracking-tighter sm:text-3xl">
        {title}
      </h2>
      <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {proposals.map((proposal) => (
          <Card key={proposal.id} className="flex flex-col">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="font-headline text-xl">
                    {proposal.title}
                    </CardTitle>
                    <Badge variant={
                        proposal.status === 'active' ? 'default' : proposal.status === 'closed' ? 'destructive' : 'secondary'
                    } className="capitalize">{proposal.status}</Badge>
                </div>
            </CardHeader>
            <CardContent className="flex-grow">
              {proposal.status === 'active' ? (
                 <ProposalCardActions proposal={proposal} />
              ) : (
                <PastProposalCardContent proposal={proposal} />
              )}
            </CardContent>
            {proposal.status === 'pending' && (
              <CardFooter>
                 <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => handleCancel(proposal.id)}
                    disabled={isPending}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancel Proposal
                  </Button>
              </CardFooter>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user } = usePrivy();
  const { data: proposals, isLoading, mutate } = useSWR('proposals', getProposals);

  const userProposals =
    proposals?.filter((p) => p.creator === user?.wallet?.address) || [];

  const activeProposals = userProposals.filter((p) => p.status === 'active');
  const pendingProposals = userProposals.filter((p) => p.status === 'pending');
  const closedProposals = userProposals.filter((p) => p.status === 'closed');

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
          <div className="space-y-4">
            <h1 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              My Proposals
            </h1>
            <p className="text-lg text-muted-foreground">
              Track the status of all the proposals you have created.
            </p>
          </div>

          <div className="mt-12 space-y-12">
            {isLoading ? (
              <p>Loading your proposals...</p>
            ) : userProposals.length === 0 ? (
              <div className="flex min-h-[200px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card p-8 text-center">
                <p className="text-muted-foreground">
                  You haven't created any proposals yet.
                </p>
                <Button asChild className="mt-4">
                  <Link href="/propose">Create a Proposal</Link>
                </Button>
              </div>
            ) : (
              <>
                <ProposalList title="Active" proposals={activeProposals} onAction={mutate} />
                <ProposalList title="Pending" proposals={pendingProposals} onAction={mutate} />
                <ProposalList title="Closed" proposals={closedProposals} onAction={mutate} />
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
