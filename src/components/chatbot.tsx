"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useTransition, useRef, useEffect } from "react";
import { Loader2, AlertCircle, Send, User as UserIcon, Bot } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import Link from "next/link";
import {
  continueConversation,
  ChatbotInput,
} from "@/ai/flows/chatbot-flow";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const formSchema = z.object({
  message: z.string().min(1, "Không thể gửi tin nhắn trống."),
});

type FormValues = z.infer<typeof formSchema>;

type Message = {
  role: "user" | "model";
  parts: { text: string }[];
};

export function Chatbot() {
  const [isPending, startTransition] = useTransition();
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  });
  
  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);

  const onSubmit = (values: FormValues) => {
    setError(null);
    const apiKey = localStorage.getItem("gemini_api_key");
    if (!apiKey) {
      setError("Vui lòng đặt Khóa API của bạn trong trang Cài đặt.");
      return;
    }
    const apiEndpoint = localStorage.getItem("gemini_api_endpoint");

    const newMessages: Message[] = [
      ...messages,
      { role: "user", parts: [{ text: values.message }] },
    ];
    setMessages(newMessages);
    form.reset();

    startTransition(async () => {
      try {
        const input: ChatbotInput = {
            history: messages,
            message: values.message,
            apiKey: apiKey,
            apiEndpoint: apiEndpoint ? apiEndpoint : undefined,
        };
        const responseText = await continueConversation(input);
        setMessages([
          ...newMessages,
          { role: "model", parts: [{ text: responseText }] },
        ]);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Đã xảy ra lỗi không xác định.");
        // Revert user message on error
        setMessages(messages);
      }
    });
  };

  return (
    <div className="flex flex-col h-full border rounded-lg">
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-6">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground pt-8">
              Bắt đầu cuộc trò chuyện bằng cách nhập tin nhắn bên dưới.
            </div>
          )}
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                "flex items-start gap-4",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {message.role === "model" && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <Bot className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  "max-w-md rounded-lg p-3 text-sm whitespace-pre-wrap",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                {message.parts[0].text}
              </div>
              {message.role === "user" && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <UserIcon className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
           {isPending && (
            <div className="flex items-start gap-4 justify-start">
               <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <Bot className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg p-3 flex items-center">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="p-4 border-t">
        {error && (
            <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Lỗi</AlertTitle>
            <AlertDescription>
                {error}
                {error.includes("API") && (
                <Button variant="link" asChild className="p-0 h-auto mt-2">
                    <Link href="/settings">Đi tới Cài đặt để thêm khóa của bạn</Link>
                </Button>
                )}
            </AlertDescription>
            </Alert>
        )}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex items-center gap-2"
          >
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input
                      placeholder="Nhập tin nhắn của bạn..."
                      {...field}
                      autoComplete="off"
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isPending} size="icon" className="bg-accent hover:bg-accent/90 shrink-0">
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              <span className="sr-only">Gửi tin nhắn</span>
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
