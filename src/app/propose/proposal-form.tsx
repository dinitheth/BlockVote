'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2, Wand2, CheckCircle, XCircle } from 'lucide-react';
import { useState, useTransition } from 'react';
import { createProposalAction } from '@/app/admin/actions';
import { usePrivy } from '@privy-io/react-auth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters long.'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters long.'),
  durationDays: z.coerce.number().min(1),
});

type FormValues = z.infer<typeof formSchema>;

export function ProposalForm() {
  const { ready, authenticated, login, user } = usePrivy();
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{
    success: boolean;
    error?: string;
  } | null>(null);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      durationDays: 7,
    },
  });

  const onSubmit = (values: FormValues) => {
    // This function will only be called if the user is authenticated.
    // If not, the button's onClick will handle the login prompt.
    if (!user?.wallet?.address) return;

    startTransition(async () => {
      const response = await createProposalAction({
        ...values,
        candidates: [{ name: 'Yes' }, { name: 'No' }],
        creator: user.wallet?.address
      });
      setResult(response);
      if (response.success) {
        form.reset();
        router.push('/');
        router.refresh();
      }
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authenticated) {
      login();
    } else {
      form.handleSubmit(onSubmit)();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-3xl">Submit a Proposal</CardTitle>
        <CardDescription>
          Fill out the form below to propose a new vote. Your proposal will go live immediately.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={handleFormSubmit} className="space-y-8">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Should we increase the treasury budget?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Frame your proposal as a Yes/No question and provide context here."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="durationDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Voting Duration</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a duration" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="3">3 Days</SelectItem>
                        <SelectItem value="7">7 Days</SelectItem>
                        <SelectItem value="30">30 Days</SelectItem>
                      </SelectContent>
                    </Select>
                  <FormDescription>
                    How long the vote should run after being started.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isPending || !ready}>
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              {authenticated ? 'Submit Proposal' : 'Login & Submit'}
            </Button>
          </form>
        </Form>


          {isPending && (
              <div className="mt-6 flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <p>Submitting your proposal to the blockchain. Please wait...</p>
              </div>
          )}

          {result && !result.success && (
            <div className={'mt-6 rounded-lg border p-4 border-red-500/50 bg-red-100 dark:bg-destructive/20'}>
              <div className="flex items-center gap-2 font-bold text-red-700 dark:text-red-400">
                  <XCircle className="h-5 w-5" />
                  Error: {result.error}
                </div>
            </div>
          )}
          {result && result.success && (
             <div className={`mt-6 rounded-lg border p-4 border-green-500/50 bg-green-50/50`}>
              <div>
                  <div className="flex items-center gap-2 font-bold text-green-700">
                    <CheckCircle className="h-5 w-5" />
                    Proposal Submitted Successfully!
                  </div>
                  <p className="mt-2 text-sm text-green-600">
                    Your proposal is now live for voting. See it on the <Link href="/" className="underline">homepage</Link>.
                  </p>
                </div>
            </div>
          )}
      </CardContent>
    </Card>
  );
}
