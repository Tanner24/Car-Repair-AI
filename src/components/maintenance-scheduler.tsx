"use client";

import { useState, useTransition, useRef } from "react";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
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
import { AlertCircle, Loader2, Sparkles, Download, ZoomIn } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { generateTechnicalData, GenerateTechnicalDataInput, GenerateTechnicalDataOutput } from "@/ai/flows/schematic-generation-flow";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
  } from "@/components/ui/dialog";

const technicalDiagrams = [
    { value: "Wiring Diagram", label: "Sơ đồ dây điện (Wiring Diagram)" },
    { value: "Hydraulic Circuit", label: "Mạch thủy lực (Hydraulic Circuit)" },
    { value: "Pneumatic System", label: "Hệ thống khí nén (Pneumatic System)" },
    { value: "ECU Logic Flow", label: "Logic điều khiển ECU (ECU Logic Flow)" },
    { value: "Parts Catalog", label: "Danh mục phụ tùng (Parts Catalog)" },
];
  
const repairData = [
    { value: "Service Manual", label: "Hướng dẫn sửa chữa (Service Manual)" },
    { value: "DTC / Fault Code Manual", label: "Bảng mã lỗi (DTC Manual)" },
    { value: "Maintenance Schedule", label: "Lịch bảo dưỡng (Maintenance Schedule)" },
    { value: "Operator Manual", label: "Hướng dẫn vận hành (Operator Manual)" },
    { value: "Technical Bulletin / TSB", label: "Bản tin kỹ thuật (TSB)" },
];

export function LookupTool() {
  const [model, setModel] = useState("");
  const [requestType, setRequestType] = useState(technicalDiagrams[0].value);
  const [errorCode, setErrorCode] = useState("");
  const [generatedOutput, setGeneratedOutput] = useState<GenerateTechnicalDataOutput | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

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
          errorCode: errorCode || undefined,
          apiKey: apiKey,
          apiEndpoint: apiEndpoint ? apiEndpoint : undefined,
        };
        const result = await generateTechnicalData(input);
        setGeneratedOutput(result);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Đã xảy ra lỗi không xác định khi tra cứu tài liệu.");
      }
    });
  };

  const handleDownloadPdf = () => {
    if (!contentRef.current) {
        setError("Không tìm thấy nội dung để tạo PDF.");
        return;
    }

    setIsDownloading(true);
    setError(null);

    setTimeout(() => {
        html2canvas(contentRef.current!, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
        }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const canvasRatio = canvasWidth / canvasHeight;
            const pdfRatio = pdfWidth / pdfHeight;

            let newCanvasWidth = pdfWidth;
            let newCanvasHeight = newCanvasWidth / canvasRatio;

            if (newCanvasHeight > pdfHeight) {
                newCanvasHeight = pdfHeight;
                newCanvasWidth = newCanvasHeight * canvasRatio;
            }

            const x = (pdfWidth - newCanvasWidth) / 2;
            const y = (pdfHeight - newCanvasHeight) / 2;

            pdf.addImage(imgData, 'PNG', x, y, newCanvasWidth, newCanvasHeight);
            pdf.save(`TKKT-${model.replace(/\s+/g, '_')}-${requestType.replace(/\s/g, '_')}.pdf`);
        }).catch(err => {
            console.error("PDF generation failed", err);
            setError("Không thể tạo tệp PDF.");
        }).finally(() => {
            setIsDownloading(false);
        });
    }, 100);
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>Công cụ tra cứu</CardTitle>
        <CardDescription>
          Nhập một kiểu xe và chọn loại tài liệu bạn muốn tra cứu, AI sẽ trả về hình ảnh của tài liệu đó.
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
                if (value !== "DTC / Fault Code Manual") {
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

        {requestType === 'DTC / Fault Code Manual' && (
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
                <Dialog>
                    <div className="relative w-full h-full group">
                        <div ref={contentRef} className="w-full h-full bg-white rounded-md">
                            <ScrollArea className="w-full h-full">
                            <div className="flex items-center justify-center min-h-full p-4">
                                <img
                                    src={generatedOutput.imageDataUri}
                                    alt={`${requestType} for ${model}`}
                                    className="w-full h-auto object-contain"
                                />
                            </div>
                            </ScrollArea>
                        </div>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="icon" className="absolute top-2 right-2 bg-background/50 backdrop-blur-sm hover:bg-background/75">
                                <ZoomIn className="h-5 w-5" />
                                <span className="sr-only">Phóng to</span>
                            </Button>
                        </DialogTrigger>
                    </div>
                    <DialogContent className="max-w-6xl h-[90vh] p-2">
                        <ScrollArea className="w-full h-full">
                            <img
                                src={generatedOutput.imageDataUri}
                                alt={`${requestType} for ${model}`}
                                className="w-full h-auto object-contain"
                            />
                        </ScrollArea>
                    </DialogContent>
                </Dialog>
            ) : (
                <div className="text-center text-muted-foreground">
                    <p>Hình ảnh tài liệu do AI tra cứu sẽ xuất hiện ở đây.</p>
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
          {generatedOutput && (
            <Button
                onClick={handleDownloadPdf}
                disabled={isDownloading || isPending}
                variant="outline"
                className="ml-4"
              >
                {isDownloading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Tải xuống PDF
              </Button>
          )}
      </CardFooter>
    </Card>
  );
}
