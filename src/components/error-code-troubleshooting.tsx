"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
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
import { useState, useTransition } from "react";
import {
  errorCodeTroubleshooting,
  ErrorCodeTroubleshootingOutput,
} from "@/ai/flows/error-code-troubleshooting";
import { Loader2, AlertCircle, Wrench } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import Link from "next/link";

const formSchema = z.object({
  errorCode: z.string().min(1, "Yêu cầu mã lỗi."),
  vehicleModel: z.string().min(1, "Yêu cầu kiểu xe."),
});

type FormValues = z.infer<typeof formSchema>;

export default function ErrorCodeTroubleshooting() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<ErrorCodeTroubleshootingOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      errorCode: "",
      vehicleModel: "",
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(null);
    setError(null);
    const apiKey = localStorage.getItem("gemini_api_key");
    if (!apiKey) {
      setError("Vui lòng đặt Khóa API của bạn trong trang Cài đặt.");
      return;
    }
    const apiEndpoint = localStorage.getItem("gemini_api_endpoint");

    startTransition(async () => {
      try {
        const res = await errorCodeTroubleshooting({ ...values, apiKey, apiEndpoint: apiEndpoint ? apiEndpoint : undefined });
        setResult(res);
      } catch (e) {
        setError(e instanceof Error ? e.message : "An unknown error occurred.");
      }
    });
  };

  const parseInstructions = (text: string | undefined) => {
    if (!text) return [];
    return text.split('\n').filter(line => line.trim().startsWith('-')).map(line => line.trim().substring(1).trim());
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <Card>
        <CardHeader>
          <CardTitle>Thông tin xe</CardTitle>
          <CardDescription>
            Nhập kiểu xe và mã lỗi được hiển thị.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="vehicleModel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kiểu xe</FormLabel>
                    <FormControl>
                      <Input placeholder="ví dụ: Komatsu PC200-8" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="errorCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mã lỗi</FormLabel>
                    <FormControl>
                      <Input placeholder="ví dụ: E02" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isPending} className="bg-accent hover:bg-accent/90">
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Phân tích
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Báo cáo chẩn đoán</CardTitle>
          <CardDescription>
            Các nguyên nhân tiềm ẩn và các bước khắc phục sự cố sẽ xuất hiện ở đây.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isPending && (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}
          {error && (
             <Alert variant="destructive">
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
          {result && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-2 font-headline">Nguyên nhân tiềm ẩn</h3>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  {parseInstructions(result.potentialCauses).map((cause, i) => (
                    <li key={i}>{cause}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2 font-headline">Hướng dẫn khắc phục sự cố</h3>
                <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
                    {parseInstructions(result.troubleshootingInstructions).map((step, i) => (
                        <li key={i}>{step}</li>
                    ))}
                </ol>
              </div>

              {result.requiredTools && (
                <div>
                  <h3 className="font-semibold text-lg mb-2 font-headline flex items-center">
                    <Wrench className="mr-2 h-5 w-5" />
                    Dụng cụ cần thiết
                  </h3>
                  <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                    {parseInstructions(result.requiredTools).map((tool, i) => (
                      <li key={i}>{tool}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
