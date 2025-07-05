'use server';
/**
 * @fileOverview A chatbot flow for the construction expert AI.
 *
 * - continueConversation - A function that continues the conversation with the AI.
 * - ChatbotInput - The input type for the continueConversation function.
 * - ChatbotOutput - The return type for the continueConversation function.
 */

import {genkit, MessageData} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';

// Define the schema for a single message part (for simplicity, only text)
const MessagePartSchema = z.object({
  text: z.string(),
});

// Define the schema for a single message in the history
const HistoryMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  parts: z.array(MessagePartSchema),
});

const ChatbotInputSchema = z.object({
  history: z.array(HistoryMessageSchema).describe('The conversation history.'),
  message: z.string().describe('The latest user message.'),
  apiKey: z.string().min(1, { message: 'API Key is required.' }),
  apiEndpoint: z.string().optional(),
});
export type ChatbotInput = z.infer<typeof ChatbotInputSchema>;

export type ChatbotOutput = string;

export async function continueConversation(input: ChatbotInput): Promise<ChatbotOutput> {
  const keyAi = genkit({
    plugins: [googleAI({ apiKey: input.apiKey, ...(input.apiEndpoint && { apiEndpoint: input.apiEndpoint }) })],
  });

  const systemPrompt = `Bạn là một trợ lý AI chuyên gia về xe công trình, hoạt động như một cơ sở kiến thức.
    Nhiệm vụ của bạn là trả lời các câu hỏi chung, giải thích các khái niệm, và cung cấp thông tin nhanh chóng.
    Hãy trả lời ngắn gọn và chính xác.
    Nếu người dùng muốn được hướng dẫn sửa chữa theo từng bước, hãy gợi ý họ sử dụng tính năng "Chẩn đoán Hướng dẫn".`;

  const response = await keyAi.generate({
    model: 'googleai/gemini-2.0-flash',
    system: systemPrompt,
    history: input.history as MessageData[],
    prompt: input.message,
  });
  
  return response.text;
}
