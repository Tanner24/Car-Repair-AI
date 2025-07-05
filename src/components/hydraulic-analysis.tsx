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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState, useTransition } from "react";
import {
  analyzeHydraulicSystem,
  AnalyzeHydraulicSystemOutput,
} from "@/ai/flows/hydraulic-system-analysis";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import Link from "next/link";

const formSchema = z.object({
  issueDescription: z
    .string()
    .min(10, "Vui lòng cung cấp mô tả chi tiết về sự cố."),
});

type FormValues = z.infer<typeof formSchema>;

export function HydraulicAnalysis() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<AnalyzeHydraulicSystemOutput | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      issueDescription: "",
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

    startTransition(async () => {
      try {
        const res = await analyzeHydraulicSystem({ ...values, apiKey });
        setResult(res);
      } catch (e) {
        setError(e instanceof Error ? e.message : "An unknown error occurred.");
      }
    });
  };

  const parseList = (text: string) => {
    return text.split('\n').filter(line => line.trim().startsWith('-')).map(line => line.trim().substring(1).trim());
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <Card>
        <CardHeader>
          <CardTitle>Sự cố thủy lực</CardTitle>
          <CardDescription>
            Mô tả chi tiết sự cố thủy lực, bao gồm cả loại thiết bị.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent>
              <FormField
                control={form.control}
                name="issueDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả sự cố</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="ví dụ: Máy ủi Caterpillar có phản ứng thủy lực chậm trên tay đòn chính..."
                        className="min-h-[150px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isPending} className="bg-accent hover:bg-accent/90">
                {isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Phân tích sự cố
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Đề xuất chẩn đoán</CardTitle>
          <CardDescription>
            Các thành phần được đề xuất để kiểm tra và các bước chẩn đoán.
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
                <h3 className="font-semibold text-lg mb-2 font-headline">Các thành phần cần kiểm tra</h3>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  {parseList(result.componentsToCheck).map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2 font-headline">Trình tự chẩn đoán</h3>
                <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
                  {parseList(result.diagnosticSequence).map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
