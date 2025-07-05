"use client";

import { useState, useTransition } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, Sparkles } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { lookupTechnicalData, TechnicalLookupInput, TechnicalLookupOutput } from "@/ai/flows/schematic-generation-flow";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";

const technicalDiagrams = [
    { value: "Sơ đồ dây điện", label: "Sơ đồ dây điện (Wiring Diagram)" },
    { value: "Mạch thủy lực", label: "Mạch thủy lực (Hydraulic Circuit)" },
    { value: "Hệ thống khí nén", label: "Hệ thống khí nén (Pneumatic System)" },
    { value: "Logic điều khiển ECU", label: "Logic điều khiển ECU (ECU Logic Flow)" },
];
  
const repairData = [
    { value: "Hướng dẫn sửa chữa", label: "Hướng dẫn sửa chữa (Service Manual)" },
    { value: "Bảng mã lỗi", label: "Bảng mã lỗi (DTC Manual)" },
    { value: "Lịch bảo dưỡng", label: "Lịch bảo dưỡng (Maintenance Schedule)" },
    { value: "Hướng dẫn vận hành", label: "Hướng dẫn vận hành (Operator Manual)" },
    { value: "Bản tin kỹ thuật", label: "Bản tin kỹ thuật (TSB)" },
    { value: "Danh mục phụ tùng", label: "Danh mục phụ tùng (Parts Catalog)" },
];

export function LookupTool() {
  const [model, setModel] = useState("");
  const [requestType, setRequestType] = useState(technicalDiagrams[0].value);
  const [errorCode, setErrorCode] = useState("");
  const [generatedOutput, setGeneratedOutput] = useState<TechnicalLookupOutput | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = () => {
    setGeneratedOutput(null);
    setError(null);

    if (!model.trim()) {
      setError("Vui lòng nhập kiểu xe.");
      return;
    }

    const apiKey = localStorage.getItem("gemini_api_key");
    if (!apiKey) {
      setError("Vui lòng đặt Khóa API của bạn trong trang Cài đặt.");
      return;
    }
    const apiEndpoint = localStorage.getItem("gemini_api_endpoint");

    startTransition(async () => {
      try {
        const input: TechnicalLookupInput = {
          vehicleModel: model,
          requestType: requestType as any,
          errorCode: errorCode || undefined,
          apiKey: apiKey,
          apiEndpoint: apiEndpoint ? apiEndpoint : undefined,
        };
        const result = await lookupTechnicalData(input);
        setGeneratedOutput(result);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Đã xảy ra lỗi không xác định khi tra cứu tài liệu.");
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Công cụ tra cứu</CardTitle>
        <CardDescription>
          Nhập một kiểu xe và chọn loại tài liệu bạn muốn tra cứu. AI sẽ trích xuất tài liệu gốc và hiển thị nội dung.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <Label htmlFor="model-input">Kiểu xe</Label>
            <Input
              id="model-input"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="ví dụ: Komatsu PC200-8"
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type-select">Loại tài liệu</Label>
            <Select 
              value={requestType} 
              onValueChange={(value) => {
                setRequestType(value);
                if (value !== "Bảng mã lỗi") {
                    setErrorCode("");
                }
              }} 
              disabled={isPending}
            >
              <SelectTrigger id="type-select">
                <SelectValue placeholder="Chọn một loại tài liệu" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                    <SelectLabel>Sơ đồ & Sơ đồ khối</SelectLabel>
                    {technicalDiagrams.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                </SelectGroup>
                <SelectGroup>
                    <SelectLabel>Tài liệu & Hướng dẫn</SelectLabel>
                    {repairData.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        {requestType === 'Bảng mã lỗi' && (
            <div className="space-y-2 mb-6">
                <Label htmlFor="error-code-input">Mã lỗi (Tùy chọn)</Label>
                <Input
                    id="error-code-input"
                    value={errorCode}
                    onChange={(e) => setErrorCode(e.target.value)}
                    placeholder="ví dụ: E02 (Để trống để tra cứu toàn bộ bảng mã lỗi)"
                    disabled={isPending}
                />
            </div>
        )}
        
        <div className="w-full h-[60vh] border rounded-lg overflow-hidden bg-muted/50 p-4 flex items-center justify-center">
            {isPending ? (
                 <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p>AI đang tra cứu tài liệu... việc này có thể mất một lúc.</p>
                 </div>
            ) : generatedOutput ? (
                <ScrollArea className="w-full h-full bg-white rounded-md p-4">
                   <div
                    className="prose prose-sm max-w-none [&_svg]:max-w-full [&_svg]:h-auto"
                    dangerouslySetInnerHTML={{ __html: generatedOutput.content }}
                   />
                </ScrollArea>
            ) : (
                <div className="text-center text-muted-foreground">
                    <p>Nội dung tài liệu do AI tra cứu sẽ xuất hiện ở đây.</p>
                </div>
            )}
        </div>
        
        {error && (
            <Alert variant="destructive" className="mt-4">
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
      </CardContent>
      <CardFooter className="justify-start">
          <Button onClick={handleGenerate} disabled={isPending || !model.trim()} className="bg-accent hover:bg-accent/90">
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Tra cứu
          </Button>
      </CardFooter>
    </Card>
  );
}
