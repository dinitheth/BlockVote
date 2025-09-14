import { Header } from '@/components/header';
import { ProposalForm } from './proposal-form';

export default function ProposePage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto max-w-2xl px-4 py-8 md:px-6 md:py-12">
          <ProposalForm />
        </div>
      </main>
    </div>
  );
}
