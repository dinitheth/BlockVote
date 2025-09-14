'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
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
import { PlusCircle, Trash, Loader2, Wand2, CheckCircle, XCircle } from 'lucide-react';
import { useState, useTransition } from 'react';
import { createProposalAction } from './actions';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters long.'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters long.'),
  candidates: z
    .array(
      z.object({
        name: z.string().min(1, "Candidate's name cannot be empty."),
      })
    )
    .min(2, 'You must add at least two candidates.'),
  durationDays: z.coerce.number().min(1),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateElectionForm() {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{
    success: boolean;
    zkpConfiguration?: string;
    error?: string;
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      candidates: [{ name: '' }, { name: '' }],
      durationDays: 7,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'candidates',
  });

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      const response = await createProposalAction({ ...values, creator: '0xAdmin'});
      setResult(response);
      if (response.success) {
        form.reset();
        router.push('/');
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-12">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Create New Proposal</CardTitle>
          <CardDescription>
            Fill out the details below to set up a new proposal for voting. This will use AI to generate a secure Zero-Knowledge Proof configuration and will go live immediately.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Q3 Community Governance Vote" {...field} />
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
                        placeholder="Describe the purpose of this proposal."
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
                      How long the vote should run.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <FormLabel>Candidates / Options</FormLabel>
                <FormDescription className="mb-4">
                  Add the names of the candidates or options for this proposal.
                </FormDescription>
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2">
                      <FormField
                        control={form.control}
                        name={`candidates.${index}.name`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input placeholder={`Candidate #${index + 1}`} {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => remove(index)}
                        disabled={fields.length <= 2}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => append({ name: '' })}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Candidate
                  </Button>
                </div>
                 <FormMessage>
                  {form.formState.errors.candidates?.root?.message}
                </FormMessage>
              </div>

              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="mr-2 h-4 w-4" />
                )}
                Create Proposal & Generate ZKP
              </Button>
            </form>
          </Form>

          {isPending && (
             <div className="mt-6 flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <p>AI is generating the ZKP configuration. Please wait...</p>
             </div>
          )}

          {result && (
            <div className={`mt-6 rounded-lg border p-4 ${result.success ? 'border-green-500/50 bg-green-50/50' : 'border-red-500/50 bg-red-100 dark:bg-destructive/20'}`}>
              {result.success ? (
                <div>
                  <div className="flex items-center gap-2 font-bold text-green-700">
                    <CheckCircle className="h-5 w-5" />
                    Proposal Created Successfully!
                  </div>
                  <p className="mt-2 text-sm text-green-600">The proposal is now live. Users can see it on the homepage.</p>
                  <div className="mt-4">
                      <p className="font-semibold text-foreground">Generated ZKP Configuration:</p>
                      <pre className="mt-2 w-full overflow-x-auto rounded-md bg-background/50 p-3 font-code text-sm">
                          <code>{result.zkpConfiguration}</code>
                      </pre>
                  </div>
                </div>
              ) : (
                 <div className="flex items-center gap-2 font-bold text-red-700 dark:text-red-400">
                    <XCircle className="h-5 w-5" />
                    Error: {result.error}
                  </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
