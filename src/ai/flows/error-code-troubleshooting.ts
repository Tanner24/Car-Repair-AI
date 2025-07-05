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
});
export type ErrorCodeTroubleshootingOutput = z.infer<typeof ErrorCodeTroubleshootingOutputSchema>;

export async function errorCodeTroubleshooting(input: ErrorCodeTroubleshootingInput): Promise<ErrorCodeTroubleshootingOutput> {
  const keyAi = genkit({
    plugins: [googleAI({ apiKey: input.apiKey, ...(input.apiEndpoint && { apiEndpoint: input.apiEndpoint }) })],
  });
  
  const prompt = `Bạn là một kỹ thuật viên chuyên nghiệp với 20 năm kinh nghiệm sửa chữa các loại xe công trình như Komatsu, Hitachi, Caterpillar, Doosan, Volvo và Hyundai.

  Người dùng đã cung cấp một mã lỗi từ một kiểu xe cụ thể. Nhiệm vụ của bạn là cung cấp thông tin chính xác, chi tiết và dễ hiểu về lỗi đó.

  Trả lời với các nguyên nhân tiềm ẩn và hướng dẫn khắc phục sự cố từng bước theo cấu trúc sau:

  **1. Nguyên nhân tiềm ẩn:**
  - [Danh sách các nguyên nhân tiềm ẩn]

  **2. Hướng dẫn khắc phục sự cố:**
  - [Hướng dẫn từng bước]

  Sử dụng thông tin sau để tạo phản hồi:

  Kiểu xe: ${input.vehicleModel}
  Mã lỗi: ${input.errorCode}

  Tham khảo Hướng dẫn sử dụng nhà xưởng, Hướng dẫn dịch vụ, Sơ đồ dây điện, Mạch thủy lực và Danh mục phụ tùng khi áp dụng.

  Cung cấp câu trả lời ngắn gọn nhưng toàn diện và đề xuất các mẹo sửa chữa bổ sung nếu cần.
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
