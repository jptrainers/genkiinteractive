import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Book, Info, Lightbulb, GraduationCap } from "lucide-react";
import type { Lesson } from "@db/schema";

interface GrammarPoint extends Lesson {
  type?: "main" | "example" | "particle" | "note";
}

const GrammarLesson = () => {
  const { data: grammarPoints, isLoading } = useQuery({
    queryKey: ["lessons", "grammar"],
    queryFn: async () => {
      const response = await fetch("/api/lessons/grammar");
      const data = await response.json() as GrammarPoint[];
      return data;
    },
  });

  if (isLoading) {
    return <div>Loading grammar points...</div>;
  }

  const groupedPoints = grammarPoints?.reduce((acc: Record<string, GrammarPoint[]>, point) => {
    const mainConcept = point.title.split(' ')[0];
    if (!acc[mainConcept]) {
      acc[mainConcept] = [];
    }
    acc[mainConcept].push(point);
    return acc;
  }, {});

  return (
    <ScrollArea className="h-[calc(100vh-20rem)]">
      <div className="space-y-12">
        {Object.entries(groupedPoints || {}).map(([concept, points], index) => (
          <div key={concept}>
            {index > 0 && (
              <Separator className="my-8" />
            )}
            <Card className="overflow-hidden">
              {/* Main concept section with gradient background */}
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-8">
                <div className="flex items-center gap-4">
                  <GraduationCap className="h-8 w-8 text-primary" />
                  <h2 className="text-3xl font-bold tracking-tight">
                    {points[0].title}
                  </h2>
                </div>
                <p className="mt-4 text-lg leading-7 text-muted-foreground">
                  {points[0].content}
                </p>
              </div>

              <div className="p-8">
                {/* Examples section */}
                <div className="mb-8 rounded-lg bg-accent/10 p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <BookOpen className="h-6 w-6 text-primary" />
                    <h3 className="text-2xl font-semibold">Examples</h3>
                  </div>
                  <div className="space-y-6">
                    {points.map((point) => 
                      point.type === "example" && (
                        <div key={point.id} className="rounded-md bg-background p-4 shadow-sm">
                          <div className="flex items-start gap-4">
                            <Book className="mt-1 h-5 w-5 text-muted-foreground" />
                            <div className="space-y-2">
                              <p className="text-xl font-medium">
                                {point.content}
                              </p>
                              {point.furigana && (
                                <p className="text-sm text-muted-foreground">
                                  {point.furigana}
                                </p>
                              )}
                              {point.translation && (
                                <p className="text-muted-foreground">
                                  {point.translation}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Key points and notes */}
                <div className="rounded-lg border p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <Info className="h-6 w-6 text-primary" />
                    <h3 className="text-2xl font-semibold">Key Points</h3>
                  </div>
                  <div className="space-y-4">
                    {points.map((point) =>
                      point.type === "note" && (
                        <div key={point.id} className="flex items-start gap-3">
                          <Lightbulb className="mt-1 h-4 w-4 text-yellow-500" />
                          <p className="text-muted-foreground leading-relaxed">
                            {point.content}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default GrammarLesson;
