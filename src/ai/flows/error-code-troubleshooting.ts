// src/ai/flows/error-code-troubleshooting.ts
'use server';
/**
 * @fileOverview Error Code Troubleshooting AI agent.
 *
 * - errorCodeTroubleshooting - A function that handles the error code troubleshooting process.
 * - ErrorCodeTroubleshootingInput - The input type for the errorCodeTroubleshooting function.
 * - ErrorCodeTroubleshootingOutput - The return type for the errorCodeTroubleshooting function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ErrorCodeTroubleshootingInputSchema = z.object({
  errorCode: z.string().describe('The error code from the construction vehicle.'),
  vehicleModel: z.string().describe('The model of the construction vehicle (e.g., Komatsu PC200-8).'),
});
export type ErrorCodeTroubleshootingInput = z.infer<typeof ErrorCodeTroubleshootingInputSchema>;

const ErrorCodeTroubleshootingOutputSchema = z.object({
  potentialCauses: z.string().describe('A list of potential causes for the error code.'),
  troubleshootingInstructions: z.string().describe('Step-by-step troubleshooting instructions to diagnose the problem.'),
});
export type ErrorCodeTroubleshootingOutput = z.infer<typeof ErrorCodeTroubleshootingOutputSchema>;

export async function errorCodeTroubleshooting(input: ErrorCodeTroubleshootingInput): Promise<ErrorCodeTroubleshootingOutput> {
  return errorCodeTroubleshootingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'errorCodeTroubleshootingPrompt',
  input: {schema: ErrorCodeTroubleshootingInputSchema},
  output: {schema: ErrorCodeTroubleshootingOutputSchema},
  prompt: `You are an expert technician with 20 years of experience in repairing construction vehicles such as Komatsu, Hitachi, Caterpillar, Doosan, Volvo, and Hyundai.

  The user has provided an error code from a specific vehicle model. Your task is to provide accurate, detailed, and easy-to-understand information regarding the error.

  Respond with the potential causes and step-by-step troubleshooting instructions in the following structure:

  **1. Potential Causes:**
  - [List of potential causes]

  **2. Troubleshooting Instructions:**
  - [Step-by-step instructions]

  Use the following information to generate the response:

  Vehicle Model: {{{vehicleModel}}}
  Error Code: {{{errorCode}}}

  Refer to Workshop Manuals, Service Manuals, Wiring Diagrams, Hydraulic Circuits, and Parts Catalogs where applicable.

  Provide concise yet comprehensive answers and suggest additional repair tips if necessary.
  `,
});

const errorCodeTroubleshootingFlow = ai.defineFlow(
  {
    name: 'errorCodeTroubleshootingFlow',
    inputSchema: ErrorCodeTroubleshootingInputSchema,
    outputSchema: ErrorCodeTroubleshootingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
