'use server';
/**
 * @fileOverview AI flow for looking up and extracting technical vehicle documents.
 *
 * - lookupTechnicalData - A function that handles the technical data lookup process.
 * - TechnicalLookupInput - The input type for the lookupTechnicalData function.
 * - TechnicalLookupOutput - The return type for the lookupTechnicalData function.
 */

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';

const requestTypes = [
  "Service Manual",
  "Wiring Diagram",
  "Hydraulic Circuit",
  "Pneumatic System",
  "Parts Catalog",
  "DTC / Fault Code Manual",
  "Maintenance Schedule",
  "ECU Logic Flow",
  "Operator Manual",
  "Technical Bulletin / TSB"
] as const;

const TechnicalLookupInputSchema = z.object({
  vehicleModel: z.string().describe('The model of the construction vehicle.'),
  requestType: z.enum(requestTypes).describe('The type of diagram or data to generate.'),
  errorCode: z.string().optional().describe('An optional error code to look up if the request type is for a DTC manual.'),
  apiKey: z.string().min(1, { message: 'API Key is required.' }),
  apiEndpoint: z.string().optional(),
});
export type TechnicalLookupInput = z.infer<typeof TechnicalLookupInputSchema>;

const TechnicalLookupOutputSchema = z.object({
  content: z.string().describe("The looked-up technical content, formatted as Markdown. For diagrams, this will be an SVG string. For data, it will be tables and text."),
});
export type TechnicalLookupOutput = z.infer<typeof TechnicalLookupOutputSchema>;

function getLookupPrompt(input: TechnicalLookupInput): string {
  const { vehicleModel, requestType, errorCode } = input;

  let detail = `The user wants the "${requestType}" for a "${vehicleModel}".`;
  let formatInstruction = `
    - For textual data (Service Manuals, Parts Catalogs, Maintenance Schedules), provide key information in well-structured Markdown. Use tables, lists, and bold text.
    - For diagrams (Wiring, Hydraulic, Pneumatic, ECU Logic), you MUST generate a valid, detailed SVG image. The SVG must be self-contained and renderable. It must be compliant with industry standards (e.g., ISO 1219 for hydraulics). Include labels, component identifiers, and clear connection lines.
    - For DTC / Fault Code lookups, provide a Markdown table with columns: 'Code', 'Description', 'Potential Causes', and 'Troubleshooting Steps'.`;

  if (requestType === 'DTC / Fault Code Manual' && errorCode) {
    detail = `The user specifically wants details for fault code "${errorCode}" from the DTC manual for a "${vehicleModel}".`
  }

  return `You are an expert AI technical service assistant with access to a comprehensive database of OEM technical documents. Your task is to look up and extract the requested information and present it in the specified format.

Request Details:
${detail}

Output Format Requirements:
Your entire response must be a single block of text containing ONLY the requested content (Markdown or SVG). Do not add any conversational text, introductions, or XML/HTML wrappers beyond the SVG itself.
${formatInstruction}

Generate the content now. Ensure it's accurate, detailed, and professionally formatted for a technician.`;
}


export async function lookupTechnicalData(input: TechnicalLookupInput): Promise<TechnicalLookupOutput> {
  const keyAi = genkit({
    plugins: [googleAI({ apiKey: input.apiKey, ...(input.apiEndpoint && { apiEndpoint: input.apiEndpoint }) })],
  });

  const prompt = getLookupPrompt(input);
  
  const { output } = await keyAi.generate({
    model: 'googleai/gemini-2.0-flash',
    prompt: prompt,
    output: {
      schema: TechnicalLookupOutputSchema,
    },
  });

  if (!output || !output.content) {
      throw new Error('AI failed to lookup or generate the technical content.');
  }
  
  return output;
}
