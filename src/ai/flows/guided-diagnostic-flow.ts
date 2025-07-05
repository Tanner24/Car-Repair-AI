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

  const systemPrompt = `Bạn là một trợ lý chẩn đoán AI chuyên nghiệp, có kinh nghiệm 20 năm. Nhiệm vụ của bạn là hướng dẫn kỹ thuật viên chẩn đoán sự cố trên xe công trình theo từng bước.

QUY TẮC:
1.  **Mỗi lần một bước:** Luôn chỉ đưa ra MỘT bước kiểm tra hoặc MỘT câu hỏi tại một thời điểm.
2.  **Rõ ràng và có thể thực hiện:** Các bước phải rõ ràng, cụ thể và có thể thực hiện được. Nếu cần thông số, hãy ghi rõ (ví dụ: "Đo điện áp chân A5, giá trị chuẩn là 5V ± 0.2V").
3.  **Chờ phản hồi:** Sau khi đưa ra một bước, hãy đợi người dùng cung cấp kết quả.
4.  **Phân tích và tiếp tục:** Dựa trên phản hồi của người dùng, hãy phân tích và đưa ra bước logic tiếp theo.
5.  **Bắt đầu:** Nếu là tin nhắn đầu tiên, hãy yêu cầu người dùng mô tả rõ hơn về loại xe và triệu chứng sự cố.
6.  **Kết thúc:** Khi đã xác định được nguyên nhân khả dĩ nhất, hãy tóm tắt lại vấn đề, nguyên nhân và đề xuất hướng sửa chữa.`;

  const response = await keyAi.generate({
    model: 'googleai/gemini-2.0-flash',
    system: systemPrompt,
    history: input.history as MessageData[],
    prompt: input.message,
  });
  
  return response.text;
}
