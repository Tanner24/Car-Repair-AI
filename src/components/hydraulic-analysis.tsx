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
  analyzeElectricalSystem,
  AnalyzeElectricalSystemOutput,
} from "@/ai/flows/hydraulic-system-analysis";
import { Loader2, AlertCircle, ScrollArea } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import Link from "next/link";

const formSchema = z.object({
    electricalIssueDescription: z
    .string()
    .min(10, "Vui lòng cung cấp mô tả chi tiết về sự cố điện."),
});

type FormValues = z.infer<typeof formSchema>;

export function ElectricalAnalysis() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<AnalyzeElectricalSystemOutput | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        electricalIssueDescription: "",
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
        const res = await analyzeElectricalSystem({ ...values, apiKey, apiEndpoint: apiEndpoint ? apiEndpoint : undefined });
        setResult(res);
      } catch (e) {
        setError(e instanceof Error ? e.message : "An unknown error occurred.");
      }
    });
  };

  const parseList = (text: string | undefined) => {
    if (!text) return [];
    return text.split('\n').filter(line => line.trim().startsWith('-') || /^\d+\./.test(line.trim())).map(line => line.trim().replace(/^-/, '').trim());
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <Card>
        <CardHeader>
          <CardTitle>Sự cố điện</CardTitle>
          <CardDescription>
            Mô tả chi tiết sự cố điện, bao gồm cả loại xe và hệ thống.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent>
              <FormField
                control={form.control}
                name="electricalIssueDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả sự cố</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="ví dụ: Xe HOWO không nổ máy, relay đề không hoạt động khi bấm công tắc..."
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
                Phân tích sự cố điện
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Kết quả tra cứu</CardTitle>
          <CardDescription>
            Sơ đồ, vị trí linh kiện và các bước chẩn đoán sẽ xuất hiện ở đây.
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
              {result.relatedDiagramName && (
                <div>
                  <h3 className="font-semibold text-lg mb-2 font-headline">Tên sơ đồ mạch liên quan</h3>
                  <p className="text-muted-foreground">{result.relatedDiagramName}</p>
                </div>
              )}
              {result.componentLocations && (
                <div>
                  <h3 className="font-semibold text-lg mb-2 font-headline">Vị trí giắc, cầu chì, relay liên quan</h3>
                  <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                    {parseList(result.componentLocations).map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {result.diagnosticSteps && (
                <div>
                  <h3 className="font-semibold text-lg mb-2 font-headline">Gợi ý kiểm tra từ dễ đến khó</h3>
                  <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
                    {parseList(result.diagnosticSteps).map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ol>
                </div>
              )}
              {result.svgDiagram && (
                 <div>
                    <h3 className="font-semibold text-lg mb-2 font-headline">Sơ đồ điện</h3>
                    <div className="w-full h-auto p-4 border rounded-lg bg-white overflow-hidden">
                        <div
                            className="prose prose-sm max-w-none [&_svg]:max-w-full [&_svg]:h-auto"
                            dangerouslySetInnerHTML={{ __html: result.svgDiagram }}
                        />
                    </div>
                 </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
