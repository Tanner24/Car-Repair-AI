'use server';
/**
 * @fileOverview Analyzes electrical system issues by searching the web and provides diagnostic suggestions.
 *
 * - analyzeElectricalSystem - A function that analyzes electrical system issues.
 * - AnalyzeElectricalSystemInput - The input type for the analyzeElectricalSystem function.
 * - AnalyzeElectricalSystemOutput - The return type for the analyzeElectricalSystem function.
 */

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';
import {ai} from '@/ai/genkit'; // Import the global ai instance for definitions

// Define the tool for searching technical documents online
const searchTechnicalDocumentsTool = ai.defineTool(
  {
    name: 'searchTechnicalDocuments',
    description: 'Searches the web for technical documents, wiring diagrams, and service manuals for construction vehicles and trucks. Use this to find information before answering the user.',
    inputSchema: z.object({
      query: z.string().describe('A specific search query, e.g., "HOWO A7 starter motor wiring diagram" or "Komatsu PC200-8 hydraulic system diagram".'),
    }),
    outputSchema: z.string(),
  },
  async ({query}) => {
    // In a real application, this would call a search engine API.
    // For this prototype, we'll return simulated results.
    console.log(`Simulating web search for: ${query}`);
    return `Simulated web search results for '${query}': Found several relevant documents, including official-looking wiring diagrams, forum discussions from other technicians who faced similar issues, and video tutorials on component testing. The key information suggests checking the main power relay and the fuse for the starting circuit.`;
  }
);


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

  const systemPrompt = `Bạn là một kỹ thuật viên điện ô tô chuyên nghiệp với 20 năm kinh nghiệm. Nhiệm vụ của bạn là chẩn đoán sự cố điện dựa trên mô tả của người dùng.

QUY TRÌNH BẮT BUỘC:
1.  **Sử dụng công cụ:** Trước tiên, hãy sử dụng công cụ \`searchTechnicalDocuments\` để tìm kiếm tài liệu kỹ thuật liên quan trên internet. Tạo một truy vấn tìm kiếm cụ thể dựa trên mô tả sự cố.
2.  **Phân tích và Tổng hợp:** Dựa vào **kết quả tìm kiếm từ công cụ** và kiến thức chuyên môn của bạn, hãy đưa ra một phân tích chi tiết.
3.  **Định dạng đầu ra:** Cung cấp phản hồi chi tiết theo đúng cấu trúc JSON được yêu cầu. Phản hồi phải bao gồm:
    *   **relatedDiagramName:** Xác định và nêu tên sơ đồ mạch chính.
    *   **componentLocations:** Liệt kê các vị trí quan trọng cần kiểm tra.
    *   **diagnosticSteps:** Cung cấp các bước chẩn đoán theo thứ tự từ dễ đến khó.
    *   **svgDiagram:** Tạo một sơ đồ điện dạng SVG đơn giản, tuân thủ tiêu chuẩn, minh họa cho mạch điện liên quan.
`;

  const { output } = await keyAi.generate({
    model: 'googleai/gemini-2.0-flash',
    system: systemPrompt,
    prompt: `Mô tả sự cố của người dùng: "${input.electricalIssueDescription}"`,
    tools: [searchTechnicalDocumentsTool],
    output: {
      schema: AnalyzeElectricalSystemOutputSchema,
    },
  });

  return output!;
}
