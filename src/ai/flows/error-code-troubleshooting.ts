// src/ai/flows/error-code-troubleshooting.ts
'use server';
/**
 * @fileOverview Error Code Troubleshooting AI agent.
 *
 * - errorCodeTroubleshooting - A function that handles the error code troubleshooting process.
 * - ErrorCodeTroubleshootingInput - The input type for the errorCodeTroubleshooting function.
 * - ErrorCodeTroubleshootingOutput - The return type for the errorCodeTroubleshooting function.
 */

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';

const ErrorCodeTroubleshootingInputSchema = z.object({
  errorCode: z.string().describe('The error code from the construction vehicle.'),
  vehicleModel: z.string().describe('The model of the construction vehicle (e.g., Komatsu PC200-8).'),
  apiKey: z.string().min(1, { message: 'API Key is required.' }),
  apiEndpoint: z.string().optional(),
});
export type ErrorCodeTroubleshootingInput = z.infer<typeof ErrorCodeTroubleshootingInputSchema>;

const ErrorCodeTroubleshootingOutputSchema = z.object({
  potentialCauses: z.string().describe('A list of potential causes for the error code.'),
  troubleshootingInstructions: z.string().describe('Step-by-step troubleshooting instructions to diagnose the problem.'),
  requiredTools: z.string().describe('A detailed list of specific tools and consumables needed for the repair (e.g., "14mm wrench", "multimeter", "electrical tape", "zip ties").'),
});
export type ErrorCodeTroubleshootingOutput = z.infer<typeof ErrorCodeTroubleshootingOutputSchema>;

export async function errorCodeTroubleshooting(input: ErrorCodeTroubleshootingInput): Promise<ErrorCodeTroubleshootingOutput> {
  const keyAi = genkit({
    plugins: [googleAI({ apiKey: input.apiKey, ...(input.apiEndpoint && { apiEndpoint: input.apiEndpoint }) })],
  });
  
  const prompt = `Bạn là một kỹ thuật viên chuyên nghiệp với 20 năm kinh nghiệm sửa chữa các loại xe công trình như Komatsu, Hitachi, Caterpillar, Doosan, Volvo và Hyundai.

  Nhiệm vụ của bạn là chẩn đoán mã lỗi cho xe: **${input.vehicleModel}** với mã lỗi **${input.errorCode}**.

  Hãy cung cấp một báo cáo chẩn đoán **ngắn gọn, dễ hiểu nhưng đầy đủ chi tiết kỹ thuật**.

  Trả lời theo cấu trúc sau:

  **1. Nguyên nhân tiềm ẩn:**
  - [Liệt kê ngắn gọn các nguyên nhân chính]

  **2. Hướng dẫn khắc phục sự cố:**
  - [Cung cấp các bước sửa chữa **chi tiết, theo thứ tự**. Mỗi bước phải rõ ràng và bao gồm các **thông số kỹ thuật cụ thể** cần đo lường nếu có. Ví dụ: 'Dùng đồng hồ vạn năng đo điện áp tại chân số 2 của giắc cắm, giá trị phải nằm trong khoảng 4.8V - 5.2V'.]
  
  **3. Dụng cụ cần thiết:**
  - [Liệt kê **chi tiết và cụ thể** từng dụng cụ và vật tư tiêu hao. Ví dụ: thay vì "cờ lê", hãy ghi "cờ lê 14mm". Bao gồm cả những thứ như băng dính điện, dây rút, giẻ lau nếu cần thiết.]

  Sử dụng ngôn ngữ đơn giản, đi thẳng vào vấn đề.
  `;

  const { output } = await keyAi.generate({
    model: 'googleai/gemini-2.0-flash',
    prompt: prompt,
    output: {
      schema: ErrorCodeTroubleshootingOutputSchema,
    },
  });
  return output!;
}
