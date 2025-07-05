"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
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
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle, Eye, Loader2, Sparkles } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { generateTechnicalData, GenerateTechnicalDataInput, GenerateTechnicalDataOutput } from "@/ai/flows/schematic-generation-flow";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";

const technicalDiagrams = [
    { value: "Sơ đồ dây điện", label: "Sơ đồ dây điện" },
    { value: "Mạch thủy lực", label: "Mạch thủy lực" },
    { value: "Mạch khí nén", label: "Mạch khí nén" },
    { value: "Logic điều khiển ECU", label: "Logic điều khiển ECU" },
    { value: "Bố trí linh kiện trên xe", label: "Bố trí linh kiện trên xe" },
    { value: "Danh mục phụ tùng", label: "Sơ đồ nổ phụ tùng" },
  ];
  
  const repairData = [
    { value: "Bảng mã lỗi", label: "Bảng mã lỗi (DTC)" },
    { value: "Quy trình bảo dưỡng định kỳ", label: "Quy trình bảo dưỡng" },
  ];

export function TechnicalDataViewer() {
  const [model, setModel] = useState("");
  const [requestType, setRequestType] = useState(technicalDiagrams[0].value);
  const [generatedOutput, setGeneratedOutput] = useState<GenerateTechnicalDataOutput | null>(null);
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
        const input: GenerateTechnicalDataInput = {
          vehicleModel: model,
          requestType: requestType as any,
          apiKey: apiKey,
          apiEndpoint: apiEndpoint ? apiEndpoint : undefined,
        };
        const result = await generateTechnicalData(input);
        setGeneratedOutput(result);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Đã xảy ra lỗi không xác định khi tạo dữ liệu.");
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trình tạo dữ liệu kỹ thuật</CardTitle>
        <CardDescription>
          Nhập một kiểu xe và chọn loại sơ đồ hoặc dữ liệu, sau đó yêu cầu AI tạo kết quả.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
            <Label htmlFor="type-select">Loại dữ liệu</Label>
            <Select value={requestType} onValueChange={setRequestType} disabled={isPending}>
              <SelectTrigger id="type-select">
                <SelectValue placeholder="Chọn một loại dữ liệu" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                    <SelectLabel>Sơ đồ kỹ thuật</SelectLabel>
                    {technicalDiagrams.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                </SelectGroup>
                <SelectGroup>
                    <SelectLabel>Dữ liệu hỗ trợ sửa chữa</SelectLabel>
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
        
        <div className="w-full h-[60vh] border rounded-lg overflow-hidden bg-muted/50 p-4 flex items-center justify-center">
            {isPending ? (
                 <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p>AI đang xử lý yêu cầu... việc này có thể mất một lúc.</p>
                 </div>
            ) : generatedOutput ? (
                generatedOutput.outputType === 'image' ? (
                    <Dialog>
                    <DialogTrigger asChild>
                        <button className="relative w-full h-full cursor-pointer group focus:outline-none">
                        <Image
                            src={generatedOutput.content}
                            alt={`Dữ liệu cho ${model} - ${requestType}`}
                            layout="fill"
                            objectFit="contain"
                            className="group-hover:opacity-50 transition-opacity"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                            <Eye className="w-10 h-10" />
                            <p className="font-semibold mt-2">Xem ảnh</p>
                        </div>
                        </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-6xl h-[90vh] p-2">
                        <Image
                        src={generatedOutput.content}
                        alt={`Dữ liệu cho ${model} - ${requestType}`}
                        layout="fill"
                        objectFit="contain"
                        />
                    </DialogContent>
                    </Dialog>
                ) : (
                    <ScrollArea className="w-full h-full bg-background rounded-md">
                        <pre className="text-sm whitespace-pre-wrap font-code p-4">{generatedOutput.content}</pre>
                    </ScrollArea>
                )
            ) : (
                <div className="text-center text-muted-foreground">
                    <p>Kết quả do AI tạo sẽ xuất hiện ở đây.</p>
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
      <CardFooter>
          <Button onClick={handleGenerate} disabled={isPending || !model.trim()} className="bg-accent hover:bg-accent/90">
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Tạo dữ liệu
          </Button>
      </CardFooter>
    </Card>
  );
}
