'use server';
/**
 * @fileOverview AI flow for looking up and generating various types of technical vehicle data.
 *
 * - generateTechnicalData - A function that handles the technical data generation process.
 * - GenerateTechnicalDataInput - The input type for the generateTechnicalData function.
 * - GenerateTechnicalDataOutput - The return type for the generateTechnicalData function.
 */

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';

const requestTypes = [
  "Service Manual",
  "Wiring Diagram",
  "Hydraulic Circuit",
  "Pneumatic System",
  "Parts Catalog",
  "DTC / Fault Code Manual",
  "Maintenance Schedule",
  "ECU Logic Flow",
  "Operator Manual",
  "Technical Bulletin / TSB"
] as const;

const svgRequestTypes = [
  "Wiring Diagram",
  "Hydraulic Circuit",
  "Pneumatic System",
  "Parts Catalog",
  "ECU Logic Flow",
];

const GenerateTechnicalDataInputSchema = z.object({
  vehicleModel: z.string().describe('The model of the construction vehicle.'),
  requestType: z.enum(requestTypes).describe('The type of diagram or data to generate.'),
  errorCode: z.string().optional().describe('An optional error code to look up.'),
  apiKey: z.string().min(1, { message: 'API Key is required.' }),
  apiEndpoint: z.string().optional(),
});
export type GenerateTechnicalDataInput = z.infer<typeof GenerateTechnicalDataInputSchema>;

const GenerateTechnicalDataOutputSchema = z.object({
  outputType: z.enum(['svg', 'markdown']),
  content: z.string().describe("The generated content. An SVG string for diagrams, or a Markdown string for text."),
});
export type GenerateTechnicalDataOutput = z.infer<typeof GenerateTechnicalDataOutputSchema>;

function getPromptForRequest(input: GenerateTechnicalDataInput): string {
    const { vehicleModel, requestType, errorCode } = input;

    const basePrompt = `Bạn là một AI kỹ thuật viên chuyên nghiệp, có quyền truy cập toàn bộ tài liệu kỹ thuật của các hãng xe công trình, xe tải, xe đặc chủng.
Nhiệm vụ của bạn là tra cứu, trích xuất và diễn giải các tài liệu kỹ thuật gốc (OEM documents) theo yêu cầu người dùng cho xe: "${vehicleModel}".

Yêu cầu cụ thể là: "${requestType}".

---
`;

    switch (requestType) {
        // SVG Outputs
        case "Wiring Diagram":
            return basePrompt + "Hãy tạo một Sơ đồ dây điện (Wiring Diagram) chi tiết ở định dạng vector SVG. Sơ đồ phải tuân thủ nghiêm ngặt các ký hiệu kỹ thuật chuẩn ISO và JIS. Sơ đồ phải rõ ràng, chuyên nghiệp, bao gồm các hệ thống liên quan, màu dây (bằng cả thuộc tính `stroke` và thẻ `<text>`), mã giắc nối, và mã pin. Trả về DUY NHẤT mã SVG, không có bất kỳ văn bản giải thích nào khác.";
        case "Hydraulic Circuit":
            return basePrompt + "Hãy tạo một Sơ đồ mạch thủy lực (Hydraulic Circuit) chi tiết ở định dạng vector SVG. Sơ đồ phải sử dụng các ký hiệu thủy lực chuẩn ISO 1219. Sơ đồ phải bao gồm các thành phần chính như: bơm thủy lực, xi-lanh, các van điều khiển, đường ống, và bình chứa, kèm theo sơ đồ dòng chảy. Trả về DUY NHẤT mã SVG, không có bất kỳ văn bản giải thích nào khác.";
        case "Pneumatic System":
            return basePrompt + "Hãy tạo một Sơ đồ mạch khí nén (Pneumatic Circuit) cho hệ thống liên quan (ví dụ: phanh hơi) ở định dạng vector SVG. Sơ đồ phải sử dụng ký hiệu chuẩn ISO 1219, bao gồm: van xả, các cảm biến, bộ sấy khí, và các van điều khiển. Ghi rõ luồng khí và áp suất danh định trên sơ đồ. Trả về DUY NHẤT mã SVG, không có bất kỳ văn bản giải thích nào khác.";
        case "ECU Logic Flow":
            return basePrompt + "Hãy tạo một Sơ đồ khối thể hiện luồng logic điều khiển của ECU (ECU System Flow) ở định dạng vector SVG. Sơ đồ phải mô tả quá trình từ tín hiệu cảm biến đầu vào, qua khối xử lý của ECU, đến các cơ cấu chấp hành đầu ra. Minh họa cho các logic quan trọng. Sử dụng các khối và đường nối rõ ràng. Trả về DUY NHẤT mã SVG, không có bất kỳ văn bản giải thích nào khác.";
        case "Parts Catalog":
             return basePrompt + "Hãy tạo một Sơ đồ nổ (Exploded Parts View) cho một hệ thống chính của xe ở định dạng vector SVG. Sơ đồ phải thể hiện các chi tiết được tháo rời một cách trực quan, có đánh số và đường chỉ dẫn rõ ràng tới từng bộ phận. Phải bao gồm một bảng chú thích (legend) bên trong SVG liệt kê mã và tên phụ tùng tương ứng với các con số. Trả về DUY NHẤT mã SVG, không có bất kỳ văn bản giải thích nào khác.";

        // Markdown Outputs
        case "Service Manual":
            return basePrompt + "Hãy trích xuất và tóm tắt nội dung từ Service Manual. Tập trung vào các quy trình tháo lắp, thông số kỹ thuật, và các lưu ý quan trọng liên quan đến yêu cầu. Trình bày dưới dạng Markdown rõ ràng, có tiêu đề và các bước cụ thể.";
        case "DTC / Fault Code Manual":
            if (errorCode) {
                return `Bạn là một kỹ thuật viên chuyên nghiệp với 20 năm kinh nghiệm sửa chữa các loại xe công trình như Komatsu, Hitachi, Caterpillar, Doosan, Volvo và Hyundai.

Nhiệm vụ của bạn là chẩn đoán mã lỗi **${errorCode}** cho xe: **${vehicleModel}**.

Hãy cung cấp một báo cáo chẩn đoán **ngắn gọn, dễ hiểu nhưng đầy đủ chi tiết kỹ thuật**.

Trả lời dưới dạng Markdown. Cấu trúc phải bao gồm:

### Nguyên nhân tiềm ẩn
- [Liệt kê ngắn gọn các nguyên nhân chính]

### Hướng dẫn khắc phục sự cố
- [Cung cấp các bước sửa chữa **chi tiết, theo thứ tự**. Mỗi bước phải rõ ràng và bao gồm các **thông số kỹ thuật cụ thể** cần đo lường nếu có. Ví dụ: 'Dùng đồng hồ vạn năng đo điện áp tại chân số 2 của giắc cắm, giá trị phải nằm trong khoảng 4.8V - 5.2V'.]

### Dụng cụ cần thiết
- [Liệt kê **chi tiết và cụ thể** từng dụng cụ và vật tư tiêu hao. Ví dụ: thay vì "cờ lê", hãy ghi "cờ lê 14mm". Bao gồm cả những thứ như băng dính điện, dây rút, giẻ lau nếu cần thiết.]

Sử dụng ngôn ngữ đơn giản, đi thẳng vào vấn đề.`;
            }
            return basePrompt + "Hãy cung cấp Bảng mã lỗi (DTC & Diagnostic) cho dòng xe này. Trình bày dưới dạng bảng Markdown. Bảng cần có các cột: 'Mã lỗi' (bao gồm mã OBD-II và mã riêng của hãng nếu có), 'Mô tả lỗi', 'Nguyên nhân phổ biến', và 'Hướng xử lý chi tiết'.";
        case "Maintenance Schedule":
            return basePrompt + "Hãy cung cấp Lịch bảo dưỡng định kỳ (Maintenance Schedule) cho xe này. Trình bày dưới dạng bảng Markdown theo từng mốc (ví dụ: 5.000km, 10.000km, 40.000km). Liệt kê các công việc cụ thể, loại và dung tích dầu/nhớt, và các thông số quan trọng như mô-men siết bu-lông.";
        case "Operator Manual":
             return basePrompt + "Hãy trích xuất và tóm tắt những thông tin quan trọng từ Sách hướng dẫn sử dụng (Operator Manual). Tập trung vào các hướng dẫn vận hành an toàn, ý nghĩa các đèn báo trên bảng điều khiển, và các quy trình kiểm tra hàng ngày. Trình bày dưới dạng Markdown.";
        case "Technical Bulletin / TSB":
             return basePrompt + "Hãy tìm và tóm tắt các Bản tin kỹ thuật (Technical Service Bulletins - TSB) liên quan đến các vấn đề phổ biến của dòng xe này. Trình bày dưới dạng Markdown, mỗi TSB có tiêu đề, mô tả vấn đề và giải pháp của nhà sản xuất.";
        default:
            return "Yêu cầu không hợp lệ. Vui lòng chọn một loại tài liệu được hỗ trợ.";
    }
}

export async function generateTechnicalData(input: GenerateTechnicalDataInput): Promise<GenerateTechnicalDataOutput> {
    const keyAi = genkit({
      plugins: [googleAI({ apiKey: input.apiKey, ...(input.apiEndpoint && { apiEndpoint: input.apiEndpoint }) })],
    });

    const prompt = getPromptForRequest(input);
    
    if (svgRequestTypes.includes(input.requestType as any)) {
        const response = await keyAi.generate({
            model: 'googleai/gemini-2.0-flash',
            prompt: prompt
        });

        let content = response.text.trim();
        // The model might wrap the SVG in markdown code fences. Let's extract it.
        if (content.startsWith("```svg")) {
            content = content.substring(5, content.length - 3).trim();
        } else if (content.startsWith("```")) {
            content = content.substring(3, content.length - 3).trim();
        }
        
        return { outputType: 'svg', content };
    } else {
        const response = await keyAi.generate({
            model: 'googleai/gemini-2.0-flash',
            prompt: prompt
        });

        return { outputType: 'markdown', content: response.text };
    }
}
