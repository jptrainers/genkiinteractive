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
import type { Lesson } from "@db/schema";

const Grammar = () => {
  const { data: grammarPoints, isLoading } = useQuery({
    queryKey: ["lessons", "grammar"],
    queryFn: async () => {
      const response = await fetch("/api/lessons/grammar");
      const data = await response.json() as Lesson[];
      return data;
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
        {grammarPoints?.map((point) => (
          <AccordionItem key={point.id} value={`item-${point.id}`}>
            <AccordionTrigger className="text-lg font-semibold">
              {point.title}
            </AccordionTrigger>
            <AccordionContent>
              <Card className="p-6">
                <div className="prose max-w-none space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">Explanation</h3>
                    <p>{point.content}</p>
                  </div>
                  
                  {point.furigana && (
                    <div>
                      <h3 className="text-lg font-medium">Reading</h3>
                      <p className="text-sm text-muted-foreground">
                        {point.furigana}
                      </p>
                    </div>
                  )}
                  
                  {point.translation && (
                    <div>
                      <h3 className="text-lg font-medium">Translation</h3>
                      <p className="text-muted-foreground">
                        {point.translation}
                      </p>
                    </div>
                  )}
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
