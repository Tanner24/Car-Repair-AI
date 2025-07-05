'use server';
/**
 * @fileOverview Analyzes electrical system issues and provides diagnostic suggestions.
 *
 * - analyzeElectricalSystem - A function that analyzes electrical system issues.
 * - AnalyzeElectricalSystemInput - The input type for the analyzeElectricalSystem function.
 * - AnalyzeElectricalSystemOutput - The return type for the analyzeElectricalSystem function.
 */

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';

const AnalyzeElectricalSystemInputSchema = z.object({
    electricalIssueDescription: z
    .string()
    .describe('A detailed description of the electrical issue, including the vehicle type and system.'),
  apiKey: z.string().min(1, { message: 'API Key is required.' }),
  apiEndpoint: z.string().optional(),
});
export type AnalyzeElectricalSystemInput = z.infer<typeof AnalyzeElectricalSystemInputSchema>;

const AnalyzeElectricalSystemOutputSchema = z.object({
    relatedDiagramName: z
    .string()
    .describe('The name of the relevant electrical circuit diagram (e.g., Starting Circuit Diagram, ECU Power Diagram).'),
    componentLocations: z
    .string()
    .describe('A list of relevant components to check, like connectors, fuses, and relays, formatted as a Markdown list.'),
  diagnosticSteps: z
    .string()
    .describe('A suggested sequence of diagnostic steps, from easy to hard, formatted as a Markdown ordered list.'),
   svgDiagram: z
    .string()
    .optional()
    .describe('A valid, detailed SVG string of the relevant electrical circuit. The diagram should adhere to industry standards. If unable to generate, this field can be omitted.'),
});
export type AnalyzeElectricalSystemOutput = z.infer<typeof AnalyzeElectricalSystemOutputSchema>;

export async function analyzeElectricalSystem(input: AnalyzeElectricalSystemInput): Promise<AnalyzeElectricalSystemOutput> {
  const keyAi = genkit({
    plugins: [googleAI({ apiKey: input.apiKey, ...(input.apiEndpoint && { apiEndpoint: input.apiEndpoint }) })],
  });

  const prompt = `Bạn là một kỹ thuật viên điện ô tô chuyên nghiệp với 20 năm kinh nghiệm chẩn đoán hệ thống điện trên xe công trình, xe tải và xe đặc chủng như Komatsu, Hitachi, Caterpillar, Doosan, Volvo, Hyundai, HOWO.

  Dựa trên mô tả của người dùng về sự cố điện, hãy cung cấp một phân tích chi tiết.
  
  Mô tả sự cố: ${input.electricalIssueDescription}
  
  Hãy cung cấp phản hồi chi tiết theo đúng cấu trúc JSON được yêu cầu. Phản hồi phải bao gồm:
  1.  **relatedDiagramName:** Xác định và nêu tên sơ đồ mạch chính liên quan đến sự cố được mô tả.
  2.  **componentLocations:** Liệt kê các vị trí quan trọng cần kiểm tra như giắc cắm, cầu chì, và rơle dưới dạng danh sách Markdown.
  3.  **diagnosticSteps:** Cung cấp một danh sách các bước chẩn đoán theo thứ tự từ dễ đến khó dưới dạng danh sách Markdown có thứ tự. Bao gồm các phép đo cụ thể (ví dụ: "Kiểm tra điện áp tại chân 87 của rơle đề, phải có 12V khi bật khóa").
  4.  **svgDiagram:** Nếu có thể, tạo một sơ đồ điện dạng SVG đơn giản, tuân thủ tiêu chuẩn, minh họa cho mạch điện liên quan. Nếu không thể tạo, hãy bỏ qua trường này.
  `;

  const { output } = await keyAi.generate({
    model: 'googleai/gemini-2.0-flash',
    prompt: prompt,
    output: {
      schema: AnalyzeElectricalSystemOutputSchema,
    },
  });
  return output!;
}
