import { PageHeader } from "@/components/page-header";
import { Chatbot } from "@/components/chatbot";

export default function ChatbotPage() {
  return (
    <div className="flex flex-col gap-8 h-full">
      <PageHeader
        title="Hỏi Đáp AI"
        description="Đặt các câu hỏi chung, tra cứu nhanh thông tin kỹ thuật hoặc các định nghĩa."
      />
      <Chatbot />
    </div>
  );
}
