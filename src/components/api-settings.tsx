"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useTransition, useEffect } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  apiKey: z.string().min(1, "Yêu cầu khóa API."),
  apiEndpoint: z.string().url("Vui lòng nhập một URL hợp lệ.").optional().or(z.literal('')),
});

type FormValues = z.infer<typeof formSchema>;

export function ApiSettings() {
  const [isPending, startTransition] = useTransition();
  const [showApiKey, setShowApiKey] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      apiKey: "",
      apiEndpoint: "",
    },
  });

  useEffect(() => {
    const storedApiKey = localStorage.getItem("gemini_api_key");
    if (storedApiKey) {
      form.setValue("apiKey", storedApiKey);
    }
    const storedApiEndpoint = localStorage.getItem("gemini_api_endpoint");
    if (storedApiEndpoint) {
      form.setValue("apiEndpoint", storedApiEndpoint);
    }
  }, [form]);

  const onSubmit = (values: FormValues) => {
    startTransition(() => {
      localStorage.setItem("gemini_api_key", values.apiKey);
      if (values.apiEndpoint) {
        localStorage.setItem("gemini_api_endpoint", values.apiEndpoint);
      } else {
        localStorage.removeItem("gemini_api_endpoint");
      }
      toast({
        title: "Thành công",
        description: "Cài đặt API của bạn đã được lưu.",
      });
    });
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Khóa API Gemini</CardTitle>
        <CardDescription>
          Nhập khóa API và điểm cuối của bạn. Khóa của bạn được lưu trữ an toàn trong trình duyệt của bạn.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Khóa API của bạn</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        type={showApiKey ? "text" : "password"}
                        placeholder="AIza... hoặc sk-..."
                        {...field}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute inset-y-0 right-0 h-full px-3"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                      <span className="sr-only">
                        {showApiKey ? "Ẩn khóa API" : "Hiện khóa API"}
                      </span>
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="apiEndpoint"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Điểm cuối API (Tùy chọn)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://api.openrouter.ai/api/v1"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Tùy chọn. Sử dụng cho các dịch vụ proxy như OpenRouter.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isPending} className="bg-accent hover:bg-accent/90">
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Lưu thay đổi
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}