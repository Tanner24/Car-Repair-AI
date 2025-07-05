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
  prompt: `Bạn là một kỹ thuật viên chuyên nghiệp với 20 năm kinh nghiệm chẩn đoán hệ thống thủy lực trong các thiết bị xây dựng như Komatsu, Hitachi, Caterpillar, Doosan, Volvo và Hyundai.

  Dựa trên mô tả của người dùng về sự cố thủy lực, hãy cung cấp danh sách các bộ phận cần kiểm tra và trình tự chẩn đoán chi tiết.

  Trả lời theo cấu trúc sau:
  **Các bộ phận cần kiểm tra:** [danh sách các bộ phận]
  **Trình tự chẩn đoán:** [quy trình chẩn đoán từng bước]

  Mô tả sự cố thủy lực: {{{issueDescription}}}
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
