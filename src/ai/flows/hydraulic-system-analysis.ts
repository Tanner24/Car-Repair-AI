// Hydraulic System Analysis Tool
'use server';
/**
 * @fileOverview Analyzes hydraulic system issues and provides diagnostic suggestions.
 *
 * - analyzeHydraulicSystem - A function that analyzes hydraulic system issues.
 * - AnalyzeHydraulicSystemInput - The input type for the analyzeHydraulicSystem function.
 * - AnalyzeHydraulicSystemOutput - The return type for the analyzeHydraulicSystem function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeHydraulicSystemInputSchema = z.object({
  issueDescription: z
    .string()
    .describe('A description of the hydraulic issue, including the equipment type (e.g., Caterpillar bulldozer).'),
});
export type AnalyzeHydraulicSystemInput = z.infer<typeof AnalyzeHydraulicSystemInputSchema>;

const AnalyzeHydraulicSystemOutputSchema = z.object({
  componentsToCheck: z
    .string()
    .describe('A list of components to check, based on the issue description.'),
  diagnosticSequence: z
    .string()
    .describe('A suggested sequence of diagnostic steps to identify the root cause of the issue.'),
});
export type AnalyzeHydraulicSystemOutput = z.infer<typeof AnalyzeHydraulicSystemOutputSchema>;

export async function analyzeHydraulicSystem(input: AnalyzeHydraulicSystemInput): Promise<AnalyzeHydraulicSystemOutput> {
  return analyzeHydraulicSystemFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeHydraulicSystemPrompt',
  input: {schema: AnalyzeHydraulicSystemInputSchema},
  output: {schema: AnalyzeHydraulicSystemOutputSchema},
  prompt: `You are an expert technician with 20 years of experience diagnosing hydraulic systems in construction equipment such as Komatsu, Hitachi, Caterpillar, Doosan, Volvo, and Hyundai.

  Based on the user's description of the hydraulic issue, provide a list of components to check and a detailed diagnostic sequence.

  Respond in the following structure:
  **Components to Check:** [list of components]
  **Diagnostic Sequence:** [step-by-step diagnostic procedure]

  Hydraulic Issue Description: {{{issueDescription}}}
  `,
});

const analyzeHydraulicSystemFlow = ai.defineFlow(
  {
    name: 'analyzeHydraulicSystemFlow',
    inputSchema: AnalyzeHydraulicSystemInputSchema,
    outputSchema: AnalyzeHydraulicSystemOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
