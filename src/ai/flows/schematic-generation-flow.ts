'use server';
/**
 * @fileOverview AI flow for generating various types of technical data for vehicles.
 *
 * - generateTechnicalData - A function that handles the technical data generation process.
 * - GenerateTechnicalDataInput - The input type for the generateTechnicalData function.
 * - GenerateTechnicalDataOutput - The return type for the generateTechnicalData function.
 */

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';

const requestTypes = [
  "Sơ đồ dây điện",
  "Mạch thủy lực",
  "Mạch khí nén",
  "Logic điều khiển ECU",
  "Bố trí linh kiện trên xe",
  "Danh mục phụ tùng",
  "Bảng mã lỗi",
  "Quy trình bảo dưỡng định kỳ"
] as const;

const imageRequestTypes = [
  "Sơ đồ dây điện",
  "Mạch thủy lực",
  "Mạch khí nén",
  "Logic điều khiển ECU",
  "Bố trí linh kiện trên xe",
  "Danh mục phụ tùng"
];

const GenerateTechnicalDataInputSchema = z.object({
  vehicleModel: z.string().describe('The model of the construction vehicle.'),
  requestType: z.enum(requestTypes).describe('The type of diagram or data to generate.'),
  apiKey: z.string().min(1, { message: 'API Key is required.' }),
  apiEndpoint: z.string().optional(),
});
export type GenerateTechnicalDataInput = z.infer<typeof GenerateTechnicalDataInputSchema>;

const GenerateTechnicalDataOutputSchema = z.object({
  outputType: z.enum(['image', 'markdown']),
  content: z.string().describe("The generated content. A data URI for images, or a Markdown string for text."),
});
export type GenerateTechnicalDataOutput = z.infer<typeof GenerateTechnicalDataOutputSchema>;

function getPromptForRequest(vehicleModel: string, requestType: string): string {
    const basePrompt = `Bạn là một AI chuyên gia về dữ liệu kỹ thuật cho các loại xe công trình và xe tải nặng. Người dùng đã yêu cầu thông tin cho xe: "${vehicleModel}".\n\nYêu cầu cụ thể là: "${requestType}".\n\nHãy tạo ra dữ liệu được yêu cầu một cách chính xác, đầy đủ và chuyên nghiệp theo các tiêu chuẩn kỹ thuật cao nhất.`;

    switch (requestType) {
        // NHÓM 1 – SƠ ĐỒ KỸ THUẬT (IMAGES)
        case "Sơ đồ dây điện":
            return basePrompt + " Hãy tạo một sơ đồ dây điện (Wiring Diagram) chi tiết cho toàn bộ hệ thống điện, bao gồm: hệ thống chiếu sáng, đề nổ, các cảm biến, ECU. Sơ đồ phải hiển thị rõ ràng màu dây, mã giắc nối, mã pin, và sử dụng ký hiệu kỹ thuật chuẩn ISO. Sơ đồ phải ở dạng bản vẽ kỹ thuật đường nét đen trắng, sạch sẽ, chuyên nghiệp.";
        case "Mạch thủy lực":
            return basePrompt + " Hãy tạo một sơ đồ mạch thủy lực (Hydraulic Circuit) chi tiết. Sơ đồ phải bao gồm các thành phần chính như: bơm thủy lực, xi-lanh, các van điều khiển, đường ống, và bình chứa. Cần có sơ đồ dòng chảy và sử dụng các ký hiệu thủy lực chuẩn.";
        case "Mạch khí nén":
            return basePrompt + " Hãy tạo một sơ đồ mạch khí nén (Pneumatic Circuit) cho hệ thống phanh hơi. Sơ đồ phải bao gồm: van xả, các cảm biến ABS, bộ sấy khí, và các van điều khiển. Ghi rõ luồng khí và áp suất danh định trên sơ đồ.";
        case "Logic điều khiển ECU":
            return basePrompt + " Hãy tạo một sơ đồ khối thể hiện luồng logic điều khiển của ECU (ECU System Flow). Sơ đồ phải mô tả quá trình từ tín hiệu cảm biến đầu vào, qua khối xử lý của ECU, đến các cơ cấu chấp hành đầu ra. Minh họa cho các logic quan trọng như điều khiển turbo, kim phun, điều hòa, EGR.";
        case "Bố trí linh kiện trên xe":
            return basePrompt + " Hãy tạo một sơ đồ bố trí linh kiện trên xe (Component Layout). Sơ đồ này cần chỉ ra vị trí lắp đặt thực tế của các bộ phận quan trọng như ECU, các cảm biến chính, các mô-un điều khiển và giắc nối. Chia sơ đồ theo các vùng rõ ràng: khoang động cơ, trong cabin, trên khung sườn.";
        case "Danh mục phụ tùng":
             return basePrompt + " Hãy tạo một hình ảnh dạng sơ đồ nổ (Exploded Parts View) cho một hệ thống chính của xe (ví dụ: hệ thống phanh hoặc động cơ). Hình ảnh phải thể hiện các chi tiết được tháo rời, có đánh số và chú thích mã phụ tùng bên cạnh.";

        // NHÓM 2 – DỮ LIỆU HỖ TRỢ SỬA CHỮA (TEXT/MARKDOWN)
        case "Bảng mã lỗi":
            return basePrompt + " Hãy cung cấp Bảng mã lỗi (DTC & Diagnostic) cho dòng xe này. Trình bày dưới dạng bảng Markdown. Bảng cần có các cột: 'Mã lỗi' (bao gồm mã OBD-II và mã riêng của hãng nếu có), 'Mô tả lỗi', 'Nguyên nhân phổ biến', và 'Hướng xử lý nhanh'.";
        case "Quy trình bảo dưỡng định kỳ":
            return basePrompt + " Hãy cung cấp quy trình bảo dưỡng định kỳ (Maintenance Flow) cho xe này. Trình bày dưới dạng các bước có đánh số hoặc checklist theo từng mốc (ví dụ: 5.000km, 10.000km, 40.000km). Liệt kê các công việc cụ thể như thay dầu, kiểm tra các loại lọc, và các thông số quan trọng như mô-men siết bu-lông.";
        default:
            return basePrompt;
    }
}

export async function generateTechnicalData(input: GenerateTechnicalDataInput): Promise<GenerateTechnicalDataOutput> {
    const keyAi = genkit({
      plugins: [googleAI({ apiKey: input.apiKey, ...(input.apiEndpoint && { apiEndpoint: input.apiEndpoint }) })],
    });

    const prompt = getPromptForRequest(input.vehicleModel, input.requestType);
    
    if (imageRequestTypes.includes(input.requestType as any)) {
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
        
        return { outputType: 'image', content: media.url };
    } else {
        const response = await keyAi.generate({
            model: 'googleai/gemini-2.0-flash',
            prompt: prompt
        });

        return { outputType: 'markdown', content: response.text };
    }
}
