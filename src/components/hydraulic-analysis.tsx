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
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

const formSchema = z.object({
  issueDescription: z
    .string()
    .min(10, "Please provide a detailed description of the issue."),
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
    startTransition(async () => {
      try {
        const res = await analyzeHydraulicSystem(values);
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
          <CardTitle>Hydraulic Issue</CardTitle>
          <CardDescription>
            Describe the hydraulic problem in detail, including the equipment
            type.
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
                    <FormLabel>Issue Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Caterpillar bulldozer has slow hydraulic response on the main arm..."
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
                Analyze Issue
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Diagnostic Suggestions</CardTitle>
          <CardDescription>
            Recommended components to check and diagnostic steps.
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
                <h3 className="font-semibold text-lg mb-2 font-headline">Components to Check</h3>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  {parseList(result.componentsToCheck).map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2 font-headline">Diagnostic Sequence</h3>
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
