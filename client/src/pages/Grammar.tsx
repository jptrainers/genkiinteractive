import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import ProgressBar from "@/components/ProgressBar";

interface GrammarPoint {
  id: number;
  title: string;
  content: string;
  examples: Array<{
    japanese: string;
    furigana: string;
    english: string;
  }>;
}

const Grammar = () => {
  const { data: grammarPoints, isLoading } = useQuery({
    queryKey: ["lessons", "grammar"],
    queryFn: async () => {
      const response = await fetch("/api/lessons/grammar");
      return response.json();
    },
  });

  if (isLoading) {
    return <div>Loading grammar points...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Grammar</h1>
        <p className="mt-2 text-muted-foreground">
          Understanding the building blocks of Japanese
        </p>
      </div>

      <ProgressBar value={2} max={5} />

      <Accordion type="single" collapsible className="w-full">
        {grammarPoints?.map((point: GrammarPoint) => (
          <AccordionItem key={point.id} value={`item-${point.id}`}>
            <AccordionTrigger className="text-lg font-semibold">
              {point.title}
            </AccordionTrigger>
            <AccordionContent>
              <Card className="p-6">
                <div className="prose max-w-none">
                  <p>{point.content}</p>
                  
                  <h3 className="mt-4 text-lg font-semibold">Examples:</h3>
                  <div className="space-y-4">
                    {point.examples.map((example, index) => (
                      <div key={index} className="rounded-lg bg-accent/10 p-4">
                        <p className="text-lg font-medium">{example.japanese}</p>
                        <p className="text-sm text-muted-foreground">
                          {example.furigana}
                        </p>
                        <p className="mt-2 text-muted-foreground">
                          {example.english}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="flex justify-center space-x-4">
        <Button variant="outline">Previous Point</Button>
        <Button>Next Point</Button>
      </div>
    </div>
  );
};

export default Grammar;
