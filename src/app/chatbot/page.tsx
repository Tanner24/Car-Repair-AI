import { PageHeader } from "@/components/page-header";
import { Chatbot } from "@/components/chatbot";

export default function ChatbotPage() {
  return (
    <div className="flex flex-col gap-8 h-full">
      <PageHeader
        title="Trợ lý Chatbot"
        description="Trò chuyện với trợ lý AI để nhận được trợ giúp về các câu hỏi liên quan đến xe công trình."
      />
      <Chatbot />
    </div>
  );
}
