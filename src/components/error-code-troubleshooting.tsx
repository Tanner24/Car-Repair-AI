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
import { Loader2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

const formSchema = z.object({
  errorCode: z.string().min(1, "Error code is required."),
  vehicleModel: z.string().min(1, "Vehicle model is required."),
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
    startTransition(async () => {
      try {
        const res = await errorCodeTroubleshooting(values);
        setResult(res);
      } catch (e) {
        setError(e instanceof Error ? e.message : "An unknown error occurred.");
      }
    });
  };

  const parseAndRender = (text: string) => {
    const sections = text.split(/\s*(?=\d\.\s)/).filter(Boolean);
    return sections.map((section, index) => {
      const lines = section.trim().split('\n');
      const title = lines.shift() || '';
      return (
        <div key={index}>
          <h3 className="font-semibold text-lg mt-4 mb-2">{title}</h3>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
            {lines.map((line, lineIndex) => (
              <li key={lineIndex}>{line.replace(/^- /, '')}</li>
            ))}
          </ul>
        </div>
      );
    });
  }

  const parseInstructions = (text: string) => {
    return text.split('\n').filter(line => line.trim().startsWith('-')).map(line => line.trim().substring(1).trim());
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Information</CardTitle>
          <CardDescription>
            Enter the vehicle model and the error code displayed.
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
                    <FormLabel>Vehicle Model</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Komatsu PC200-8" {...field} />
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
                    <FormLabel>Error Code</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., E02" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isPending} className="bg-accent hover:bg-accent/90">
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Analyze
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Diagnostic Report</CardTitle>
          <CardDescription>
            Potential causes and troubleshooting steps will appear here.
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
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {result && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-2 font-headline">Potential Causes</h3>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  {parseInstructions(result.potentialCauses).map((cause, i) => (
                    <li key={i}>{cause}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2 font-headline">Troubleshooting Instructions</h3>
                <Accordion type="single" collapsible className="w-full">
                  {parseInstructions(result.troubleshootingInstructions).map((step, i) => (
                     <AccordionItem value={`item-${i}`} key={i}>
                       <AccordionTrigger>Step {i + 1}</AccordionTrigger>
                       <AccordionContent>
                         {step}
                       </AccordionContent>
                     </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
