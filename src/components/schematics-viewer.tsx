"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
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

const vehicleModels = [
  { value: "komatsu-pc200-8", label: "Komatsu PC200-8" },
  { value: "hitachi-ex120-5", label: "Hitachi EX120-5" },
  { value: "cat-320d", label: "Caterpillar 320D" },
  { value: "doosan-dx225", label: "Doosan DX225" },
  { value: "volvo-ec210", label: "Volvo EC210" },
];

const diagramTypes = [
  { value: "wiring", label: "Sơ đồ dây" },
  { value: "hydraulic", label: "Mạch thủy lực" },
  { value: "parts", label: "Danh mục phụ tùng" },
];

export function SchematicsViewer() {
  const [model, setModel] = useState(vehicleModels[0].value);
  const [type, setType] = useState(diagramTypes[0].value);
  
  // Create a unique key for the image to force re-render on change
  const imageKey = `${model}-${type}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sơ đồ tương tác</CardTitle>
        <CardDescription>
          Chọn một chiếc xe và loại sơ đồ để xem. Di chuyển bằng cách cuộn.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="space-y-2">
            <Label htmlFor="model-select">Kiểu xe</Label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger id="model-select">
                <SelectValue placeholder="Chọn một kiểu xe" />
              </SelectTrigger>
              <SelectContent>
                {vehicleModels.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="type-select">Loại sơ đồ</Label>
            <Select value={type} onValueChange={setType}>
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
        <div className="w-full h-[60vh] border rounded-lg overflow-auto bg-muted/50 p-4">
            <div className="relative w-[150%] h-[150%]">
                 <Image
                    key={imageKey}
                    src="https://placehold.co/1200x900.png"
                    alt={`sơ đồ ${model} ${type}`}
                    layout="fill"
                    objectFit="contain"
                    data-ai-hint="technical diagram"
                />
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
