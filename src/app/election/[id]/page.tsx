import { Header } from '@/components/header';
import { getProposalById } from '@/lib/data';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { VotingContainer, ResultsContainer } from './components';

type ProposalPageProps = {
  params: {
    id: string;
  };
};

export default async function ProposalPage({ params }: ProposalPageProps) {
  const proposal = await getProposalById(params.id);

  if (!proposal) {
    notFound();
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 bg-background">
        <div className="container mx-auto max-w-4xl px-4 py-8 md:px-6 md:py-12">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                {proposal.title}
              </h1>
              <Badge
                className="capitalize"
                variant={
                  proposal.status === 'active'
                    ? 'default'
                    : proposal.status === 'closed'
                    ? 'destructive'
                    : 'secondary'
                }
              >
                {proposal.status}
              </Badge>
            </div>
            <p className="text-lg text-muted-foreground">
              {proposal.description}
            </p>
          </div>
          <div className="mt-12">
            {proposal.status === 'active' ? (
              <VotingContainer proposal={proposal} />
            ) : (
              <ResultsContainer
                proposalId={proposal.id}
                title="Proposal Results"
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
