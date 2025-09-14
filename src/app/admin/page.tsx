'use client';

import { useState } from 'react';
import { CreateElectionForm } from './create-election-form';
import { PasswordPrompt } from './password-prompt';
import { Header } from '@/components/header';

// In a real app, this would be a more secure authentication mechanism.
const ADMIN_PASSWORD = 'password';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handlePasswordSubmit = (password: string) => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect password');
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
          {!isAuthenticated ? (
            <PasswordPrompt onSubmit={handlePasswordSubmit} />
          ) : (
            <CreateElectionForm />
          )}
        </div>
      </main>
    </div>
  );
}
