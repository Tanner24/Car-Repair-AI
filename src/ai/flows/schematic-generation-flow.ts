'use server';
/**
 * @fileOverview AI flow for generating schematic diagrams.
 *
 * - generateSchematic - A function that handles the schematic generation process.
 * - GenerateSchematicInput - The input type for the generateSchematic function.
 * - GenerateSchematicOutput - The return type for the generateSchematic function.
 */

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';

export const GenerateSchematicInputSchema = z.object({
  vehicleModel: z.string().describe('The model of the construction vehicle.'),
  diagramType: z.string().describe('The type of diagram to generate (e.g., wiring, hydraulic).'),
  apiKey: z.string().min(1, { message: 'API Key is required.' }),
  apiEndpoint: z.string().optional(),
});
export type GenerateSchematicInput = z.infer<typeof GenerateSchematicInputSchema>;

export const GenerateSchematicOutputSchema = z.object({
  imageDataUri: z.string().describe("The generated image as a data URI."),
});
export type GenerateSchematicOutput = z.infer<typeof GenerateSchematicOutputSchema>;

export async function generateSchematic(input: GenerateSchematicInput): Promise<GenerateSchematicOutput> {
    const keyAi = genkit({
      plugins: [googleAI({ apiKey: input.apiKey, ...(input.apiEndpoint && { apiEndpoint: input.apiEndpoint }) })],
    });

    const prompt = `Generate a detailed ${input.diagramType} for a ${input.vehicleModel}. The style should be a clean, black and white technical line drawing suitable for a service manual. Ensure all major components and connections are clearly visible and labeled where appropriate. The diagram should be highly detailed and accurate.`;
    
    const {media} = await keyAi.generate({
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        prompt: prompt,
        config: {
            responseModalities: ['TEXT', 'IMAGE'],
        },
    });

    if (!media || !media.url) {
        throw new Error("Image generation failed.");
    }
    
    return { imageDataUri: media.url };
}
