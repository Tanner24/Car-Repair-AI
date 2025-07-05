'use server';
/**
 * @fileOverview A guided, interactive diagnostic flow.
 *
 * - continueGuidedDiagnostic - A function that continues the diagnostic conversation.
 * - GuidedDiagnosticInput - The input type for the continueGuidedDiagnostic function.
 * - GuidedDiagnosticOutput - The return type for the continueGuidedDiagnostic function.
 */

import {genkit, MessageData} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';

const MessagePartSchema = z.object({
  text: z.string(),
});

const HistoryMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  parts: z.array(MessagePartSchema),
});

const GuidedDiagnosticInputSchema = z.object({
  history: z.array(HistoryMessageSchema).describe('The conversation history of the diagnostic session.'),
  message: z.string().describe('The latest user message, describing symptoms or results of a test.'),
  apiKey: z.string().min(1, { message: 'API Key is required.' }),
  apiEndpoint: z.string().optional(),
});
export type GuidedDiagnosticInput = z.infer<typeof GuidedDiagnosticInputSchema>;

export type GuidedDiagnosticOutput = string;

export async function continueGuidedDiagnostic(input: GuidedDiagnosticInput): Promise<GuidedDiagnosticOutput> {
  const keyAi = genkit({
    plugins: [googleAI({ apiKey: input.apiKey, ...(input.apiEndpoint && { apiEndpoint: input.apiEndpoint }) })],
  });

  const systemPrompt = `Bạn là một chuyên gia chẩn đoán AI, có kinh nghiệm 20 năm. Nhiệm vụ của bạn là hướng dẫn kỹ thuật viên chẩn đoán sự cố xe công trình một cách tương tác.

TUÂN THỦ NGHIÊM NGẶT CÁC QUY TẮC SAU:
1.  **Mỗi Lần Một Bước:** Chỉ đưa ra MỘT câu hỏi hoặc MỘT bước kiểm tra tại một thời điểm. Không bao giờ đưa ra nhiều bước cùng lúc.
2.  **Chờ Phản Hồi:** Luôn đợi người dùng cung cấp kết quả trước khi đưa ra bước tiếp theo.
3.  **Phân Tích & Tiếp Tục:** Dựa trên phản hồi của người dùng, hãy phân tích và đưa ra bước logic kế tiếp.
4.  **Bắt Đầu:** Khi bắt đầu, hãy hỏi về loại xe và mô tả triệu chứng.
5.  **Kết Thúc:** Khi tìm ra nguyên nhân, hãy tóm tắt vấn đề và đề xuất hướng sửa chữa.
6.  **Tập Trung:** Đừng trả lời các câu hỏi chung chung không liên quan đến quy trình chẩn đoán đang diễn ra. Hãy giữ cho cuộc trò chuyện tập trung vào việc tìm lỗi.`;

  const response = await keyAi.generate({
    model: 'googleai/gemini-2.0-flash',
    system: systemPrompt,
    history: input.history as MessageData[],
    prompt: input.message,
  });
  
  return response.text;
}
