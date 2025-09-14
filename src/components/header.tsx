import Link from 'next/link';
import { BlockVoteIcon } from './icons';
import { ThemeToggle } from './theme-toggle';
import { LoginButton } from './login-button';
import { Button } from './ui/button';
import { FilePlus2, Home } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <BlockVoteIcon className="h-6 w-6" />
            <span className="font-bold sm:inline-block font-headline">
              BlockVote
            </span>
          </Link>
          <nav className="hidden items-center space-x-6 text-sm font-medium md:flex">
            <Link
              href="/"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Proposals
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
           <Button asChild variant="outline">
              <Link href="/propose">
                <FilePlus2 className="mr-2 h-4 w-4" />
                Submit Proposal
              </Link>
            </Button>
          <ThemeToggle />
          <LoginButton />
        </div>
      </div>
    </header>
  );
}
