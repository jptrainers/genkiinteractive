import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
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
      <div className="space-y-8">
        {Object.entries(groupedPoints || {}).map(([concept, points]) => (
          <Card key={concept} className="p-6">
            <div className="prose max-w-none space-y-6">
              {/* Main concept explanation */}
              <div>
                <h2 className="mb-4 text-2xl font-bold tracking-tight">
                  {points[0].title}
                </h2>
                <p className="text-lg leading-7 text-muted-foreground">
                  {points[0].content}
                </p>
              </div>

              {/* Examples section */}
              <div className="rounded-lg bg-accent/10 p-6">
                <h3 className="mb-4 text-xl font-semibold">Examples</h3>
                <div className="space-y-4">
                  {points.map((point) => 
                    point.type === "example" && (
                      <div key={point.id} className="space-y-2">
                        <p className="text-lg font-medium">
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
                    )
                  )}
                </div>
              </div>

              {/* Important notes */}
              <div className="rounded-lg border p-6">
                <h3 className="mb-4 text-xl font-semibold">Important Notes</h3>
                <div className="space-y-2">
                  {points.map((point) =>
                    point.type === "note" && (
                      <p key={point.id} className="text-muted-foreground">
                        {point.content}
                      </p>
                    )
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
};

export default GrammarLesson;
