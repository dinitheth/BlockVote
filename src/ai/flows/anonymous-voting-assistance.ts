'use server';

/**
 * @fileOverview An AI agent for assisting with setting up Zero-Knowledge Proofs (ZKPs) for anonymous voting on the Abstract blockchain.
 *
 * - setupAnonymousVoting - A function that takes candidate options and sets up the ZKP configuration.
 * - SetupAnonymousVotingInput - The input type for the setupAnonymousVoting function.
 * - SetupAnonymousVotingOutput - The return type for the setupAnonymousVoting function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SetupAnonymousVotingInputSchema = z.object({
  candidateOptions: z
    .array(z.string())
    .describe('An array of candidate options for the voting system.'),
});
export type SetupAnonymousVotingInput = z.infer<typeof SetupAnonymousVotingInputSchema>;

const SetupAnonymousVotingOutputSchema = z.object({
  zkpConfiguration: z.string().describe('The generated Zero-Knowledge Proofs (ZKPs) configuration as a string.'),
});
export type SetupAnonymousVotingOutput = z.infer<typeof SetupAnonymousVotingOutputSchema>;

export async function setupAnonymousVoting(input: SetupAnonymousVotingInput): Promise<SetupAnonymousVotingOutput> {
  return setupAnonymousVotingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'setupAnonymousVotingPrompt',
  input: {schema: SetupAnonymousVotingInputSchema},
  output: {schema: SetupAnonymousVotingOutputSchema},
  prompt: `You are an expert in Zero-Knowledge Proofs (ZKPs) and blockchain technology, specifically for the Abstract blockchain.

You will use the provided candidate options to generate a suitable ZKP configuration for anonymous voting on the Abstract blockchain.

Candidate Options: {{{candidateOptions}}}

Provide the ZKP configuration as a string that can be directly used in the smart contract on Abstract.
Ensure that the generated configuration is secure and efficient for use in a decentralized voting system.`,
});

const setupAnonymousVotingFlow = ai.defineFlow(
  {
    name: 'setupAnonymousVotingFlow',
    inputSchema: SetupAnonymousVotingInputSchema,
    outputSchema: SetupAnonymousVotingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
