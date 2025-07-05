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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { AlertCircle, Loader2, Sparkles } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import Link from "next/link";
import { generateSchematic, GenerateSchematicInput } from "@/ai/flows/schematic-generation-flow";

const diagramTypes = [
  { value: "sơ đồ dây", label: "Sơ đồ dây" },
  { value: "mạch thủy lực", label: "Mạch thủy lực" },
  { value: "danh mục phụ tùng", label: "Danh mục phụ tùng" },
];

export function SchematicsViewer() {
  const [model, setModel] = useState("");
  const [type, setType] = useState(diagramTypes[0].value);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = () => {
    setGeneratedImage(null);
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
        const input: GenerateSchematicInput = {
          vehicleModel: model,
          diagramType: type,
          apiKey: apiKey,
          apiEndpoint: apiEndpoint ? apiEndpoint : undefined,
        };
        const result = await generateSchematic(input);
        setGeneratedImage(result.imageDataUri);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Đã xảy ra lỗi không xác định khi tạo sơ đồ.");
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trình xem sơ đồ AI</CardTitle>
        <CardDescription>
          Nhập một kiểu xe và chọn loại sơ đồ, sau đó yêu cầu AI tạo sơ đồ kỹ thuật chi tiết.
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
            <Label htmlFor="type-select">Loại sơ đồ</Label>
            <Select value={type} onValueChange={setType} disabled={isPending}>
              <SelectTrigger id="type-select">
                <SelectValue placeholder="Chọn một loại sơ đồ" />
              </SelectTrigger>
              <SelectContent>
                {diagramTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="w-full h-[60vh] border rounded-lg overflow-auto bg-muted/50 p-4 flex items-center justify-center">
            {isPending ? (
                 <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p>AI đang vẽ sơ đồ... việc này có thể mất một lúc.</p>
                 </div>
            ) : generatedImage ? (
                <div className="relative w-full h-full">
                    <Image
                        src={generatedImage}
                        alt={`sơ đồ ${model} ${type}`}
                        layout="fill"
                        objectFit="contain"
                    />
                </div>
            ) : (
                <div className="text-center text-muted-foreground">
                    <p>Sơ đồ được tạo bởi AI sẽ xuất hiện ở đây.</p>
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
            Tạo sơ đồ
          </Button>
      </CardFooter>
    </Card>
  );
}
