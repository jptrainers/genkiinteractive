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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GrammarLesson from "@/components/GrammarLesson";
import GrammarPractice from "@/components/GrammarPractice";
import type { Lesson } from "@db/schema";

interface GrammarPoint extends Lesson {
  type?: "main" | "example" | "particle" | "note";
}

const Grammar = () => {
  const { data: grammarPoints, isLoading } = useQuery({
    queryKey: ["lessons", "grammar"],
    queryFn: async () => {
      const response = await fetch("/api/lessons/grammar");
      const data = await response.json() as GrammarPoint[];
      
      // Group related grammar points by their main concept
      const groupedPoints = data.reduce((acc: Record<string, GrammarPoint[]>, point) => {
        const mainConcept = point.title.split(' ')[0]; // Group by first word (e.g., は, です)
        if (!acc[mainConcept]) {
          acc[mainConcept] = [];
        }
        acc[mainConcept].push(point);
        return acc;
      }, {});

      return Object.values(groupedPoints).flat();
    },
  });

  if (isLoading) {
    return <div>Loading grammar points...</div>;
  }

  // Group points by their main concept (XはYです, は particle)
  const uniquePoints = grammarPoints?.reduce((acc: GrammarPoint[], point) => {
    const exists = acc.find(p => p.title === point.title);
    if (!exists) {
      acc.push(point);
    }
    return acc;
  }, []);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Grammar</h1>
        <p className="mt-2 text-muted-foreground">
          Master Japanese grammar through learning and practice
        </p>
      </div>

      <Tabs defaultValue="learn" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="learn">Learn</TabsTrigger>
          <TabsTrigger value="practice">Practice</TabsTrigger>
        </TabsList>

        <TabsContent value="learn">
          <Card className="p-6">
            <GrammarLesson />
          </Card>
        </TabsContent>

        <TabsContent value="practice">
          <Card className="p-6">
            <GrammarPractice />
          </Card>
        </TabsContent>
      </Tabs>

      {/* <ProgressBar value={2} max={5} />

      <Accordion type="single" collapsible className="w-full">
        {uniquePoints?.map((point) => (
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
                      <h3 className="text-lg font-medium">Examples</h3>
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
      </div> */}
    </div>
  );
};

export default Grammar;