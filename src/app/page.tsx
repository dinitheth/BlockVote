import { Header } from '@/components/header';
import { getProposals } from '@/lib/data';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProposalCardActions } from './proposal-card-actions';
import { PastProposalCardContent } from './past-proposal-card-content';

export const revalidate = 0; // Disable caching for this page

export default async function Home() {
  const proposals = await getProposals();
  const activeProposals = proposals.filter(
    (proposal) => proposal.status === 'active'
  );
  const pastProposals = proposals.filter(
    (proposal) => proposal.status === 'closed'
  );

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
          <div className="space-y-8">
            <div>
              <h1 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Active Proposals
              </h1>
              <p className="mt-2 text-muted-foreground md:text-xl">
                Cast your vote on these ongoing proposals.
              </p>
            </div>
            {activeProposals.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {activeProposals.map((proposal) => (
                  <Card
                    key={proposal.id}
                    className="flex flex-col overflow-hidden transition-transform duration-300 ease-in-out hover:-translate-y-1 bg-card/60 backdrop-blur-lg border border-border/40 shadow-lg hover:shadow-xl"
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="font-headline text-2xl">
                          {proposal.title}
                        </CardTitle>
                        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">Active</Badge>
                      </div>
                      <CardDescription>{proposal.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      
                    </CardContent>
                    <CardFooter>
                      <ProposalCardActions proposal={proposal} />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex min-h-[200px] items-center justify-center rounded-lg border-2 border-dashed border-border bg-card/60 backdrop-blur-lg p-8 text-center">
                <p className="text-muted-foreground">
                  There are no active proposals at the moment.
                </p>
              </div>
            )}
          </div>

          <div className="mt-16">
            <h2 className="font-headline text-2xl font-bold tracking-tighter sm:text-3xl">
              Past Proposals
            </h2>
            <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pastProposals.map((proposal) => (
                <Card key={proposal.id} className="flex flex-col bg-card/60 backdrop-blur-lg border border-border/40">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="font-headline text-xl">
                        {proposal.title}
                      </CardTitle>
                      <Badge variant={proposal.status === 'closed' ? 'destructive' : 'outline'} className="capitalize">{proposal.status}</Badge>
                    </div>
                  </CardHeader>
                  <PastProposalCardContent proposal={proposal} />
                </Card>
              ))}
               {pastProposals.length === 0 && (
                 <div className="md:col-span-2 lg:col-span-3 flex min-h-[200px] items-center justify-center rounded-lg border-2 border-dashed border-border bg-card/60 backdrop-blur-lg p-8 text-center">
                    <p className="text-muted-foreground">
                    No past proposals found.
                    </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
