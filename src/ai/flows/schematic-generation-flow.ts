'use server';
/**
 * @fileOverview AI flow for looking up and generating images of technical vehicle documents.
 *
 * - generateTechnicalData - A function that handles the technical data image generation process.
 * - GenerateTechnicalDataInput - The input type for the generateTechnicalData function.
 * - GenerateTechnicalDataOutput - The return type for the generateTechnicalData function.
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

const GenerateTechnicalDataInputSchema = z.object({
  vehicleModel: z.string().describe('The model of the construction vehicle.'),
  requestType: z.enum(requestTypes).describe('The type of diagram or data to generate.'),
  errorCode: z.string().optional().describe('An optional error code to look up.'),
  apiKey: z.string().min(1, { message: 'API Key is required.' }),
  apiEndpoint: z.string().optional(),
});
export type GenerateTechnicalDataInput = z.infer<typeof GenerateTechnicalDataInputSchema>;

const GenerateTechnicalDataOutputSchema = z.object({
  imageDataUri: z.string().describe("The generated image of the technical document as a data URI."),
});
export type GenerateTechnicalDataOutput = z.infer<typeof GenerateTechnicalDataOutputSchema>;

function getGenerationPrompt(input: GenerateTechnicalDataInput): string {
    const { vehicleModel, requestType, errorCode } = input;

    let detail = `The page must clearly display a detailed "${requestType}".`;
    if (requestType === 'DTC / Fault Code Manual' && errorCode) {
        detail = `It must specifically show the troubleshooting steps for fault code "${errorCode}".`
    }

    return `Generate a photorealistic image of a page from an official technical service manual for a "${vehicleModel}".
${detail}
The style should be that of a clean, high-resolution scan of a printed manual.
It should contain intricate diagrams, text annotations, and part numbers, all in crisp black and white line art.
The layout must be dense, professional, and highly technical.
Do not include any colors or photographic elements, only technical drawings and text as found in a real service manual. The image should look like a real document.`;
}

export async function generateTechnicalData(input: GenerateTechnicalDataInput): Promise<GenerateTechnicalDataOutput> {
    const keyAi = genkit({
      plugins: [googleAI({ apiKey: input.apiKey, ...(input.apiEndpoint && { apiEndpoint: input.apiEndpoint }) })],
    });

    const prompt = getGenerationPrompt(input);
    
    const {media} = await keyAi.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: prompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media || !media.url) {
        throw new Error('Image generation failed to produce an image.');
    }
    
    return { imageDataUri: media.url };
}
