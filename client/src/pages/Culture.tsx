import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import ProgressBar from "@/components/ProgressBar";

interface CultureNote {
  id: number;
  title: string;
  content: string;
  imageUrl: string;
  quiz: {
    question: string;
    options: string[];
    correctAnswer: string;
  };
}

const Culture = () => {
  const { data: cultureNotes, isLoading } = useQuery({
    queryKey: ["lessons", "culture"],
    queryFn: async () => {
      const response = await fetch("/api/lessons/culture");
      return response.json();
    },
  });

  if (isLoading) {
    return <div>Loading culture notes...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Japanese Culture</h1>
        <p className="mt-2 text-muted-foreground">
          Discover the cultural context behind the language
        </p>
      </div>

      <ProgressBar value={4} max={5} />

      <Carousel className="w-full">
        <CarouselContent>
          {cultureNotes?.map((note: CultureNote) => (
            <CarouselItem key={note.id}>
              <Card className="p-6">
                <h2 className="mb-4 text-2xl font-semibold">{note.title}</h2>
                
                <AspectRatio ratio={16 / 9} className="mb-6">
                  <img
                    src={note.imageUrl}
                    alt={note.title}
                    className="rounded-lg object-cover"
                  />
                </AspectRatio>

                <div className="prose max-w-none">
                  <p>{note.content}</p>
                </div>

                <div className="mt-6 rounded-lg bg-accent/10 p-6">
                  <h3 className="mb-4 text-lg font-semibold">
                    Quick Knowledge Check
                  </h3>
                  <p className="mb-4">{note.quiz.question}</p>
                  <div className="space-y-2">
                    {note.quiz.options.map((option, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => {
                          // Handle quiz answer
                        }}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                </div>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>

      <div className="flex justify-center">
        <Button>Complete Lesson</Button>
      </div>
    </div>
  );
};

export default Culture;
