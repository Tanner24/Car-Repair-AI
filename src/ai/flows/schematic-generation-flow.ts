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
  "Hướng dẫn sửa chữa",
  "Sơ đồ dây điện",
  "Mạch thủy lực",
  "Hệ thống khí nén",
  "Danh mục phụ tùng",
  "Bảng mã lỗi",
  "Lịch bảo dưỡng",
  "Logic điều khiển ECU",
  "Hướng dẫn vận hành",
  "Bản tin kỹ thuật"
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

  let detail = `Người dùng muốn có tài liệu "${requestType}" cho xe "${vehicleModel}".`;
  let formatInstruction = `
    - Đối với dữ liệu dạng văn bản (ví dụ: Hướng dẫn sửa chữa, Danh mục phụ tùng, Lịch bảo dưỡng), hãy cung cấp thông tin chính dưới dạng Markdown có cấu trúc tốt. Sử dụng bảng, danh sách và chữ in đậm.
    - Đối với các sơ đồ (ví dụ: Sơ đồ dây điện, Mạch thủy lực, Hệ thống khí nén, Logic ECU), bạn PHẢI tạo ra một hình ảnh SVG hợp lệ và chi tiết. SVG phải khép kín và có thể hiển thị được. Sơ đồ phải tuân thủ các tiêu chuẩn ngành (ví dụ: ISO 1219 cho thủy lực). Bao gồm nhãn, mã định danh thành phần và các đường kết nối rõ ràng.
    - Đối với tra cứu "Bảng mã lỗi", hãy cung cấp một bảng Markdown với các cột: 'Mã', 'Mô tả', 'Nguyên nhân tiềm ẩn' và 'Các bước khắc phục sự cố'.`;

  if (requestType === 'Bảng mã lỗi' && errorCode) {
    detail = `Người dùng muốn biết chi tiết cụ thể cho mã lỗi "${errorCode}" từ tài liệu "Bảng mã lỗi" cho xe "${vehicleModel}".`
  }

  return `Bạn là một trợ lý dịch vụ kỹ thuật AI chuyên nghiệp có quyền truy cập vào cơ sở dữ liệu toàn diện về tài liệu kỹ thuật của các hãng sản xuất (OEM). Nhiệm vụ của bạn là tra cứu và trích xuất thông tin được yêu cầu, sau đó trình bày nó ở định dạng được chỉ định.

Chi tiết yêu cầu:
${detail}

Yêu cầu về định dạng đầu ra:
Toàn bộ phản hồi của bạn phải là một khối văn bản duy nhất CHỈ chứa nội dung được yêu cầu (dạng Markdown hoặc SVG). Không thêm bất kỳ văn bản trò chuyện, giới thiệu, hay thẻ XML/HTML nào khác ngoài chính SVG.
${formatInstruction}

Hãy tạo nội dung ngay bây giờ. Đảm bảo rằng nội dung chính xác, chi tiết và được định dạng chuyên nghiệp cho một kỹ thuật viên.`;
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
