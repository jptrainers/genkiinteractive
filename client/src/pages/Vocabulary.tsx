import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Flashcard from "@/components/Flashcard";
import ProgressBar from "@/components/ProgressBar";

interface VocabWord {
  id: number;
  content: string;
  translation: string;
  furigana: string;
}

const Vocabulary = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: vocabulary, isLoading } = useQuery({
    queryKey: ["lessons", "vocabulary"],
    queryFn: async () => {
      const response = await fetch("/api/lessons/vocabulary");
      return response.json();
    },
  });

  const handleNext = () => {
    if (vocabulary && currentIndex < vocabulary.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (isLoading) {
    return <div>Loading vocabulary...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Vocabulary</h1>
        <p className="mt-2 text-muted-foreground">
          Master new words through flashcards
        </p>
      </div>

      <ProgressBar 
        value={currentIndex + 1} 
        max={vocabulary?.length || 1} 
      />

      <div className="flex items-center justify-center space-x-4">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="w-96">
          {vocabulary && vocabulary[currentIndex] && (
            <Flashcard
              front={vocabulary[currentIndex].content}
              back={vocabulary[currentIndex].translation}
              furigana={vocabulary[currentIndex].furigana}
            />
          )}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={handleNext}
          disabled={!vocabulary || currentIndex === vocabulary.length - 1}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <Card className="p-6">
        <h2 className="mb-4 text-xl font-semibold">Study Tips</h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>Click the card to flip between Japanese and English</li>
          <li>Practice reading the furigana before memorizing the kanji</li>
          <li>Try to create sentences using the new vocabulary</li>
          <li>Review these words daily for better retention</li>
        </ul>
      </Card>

      <div className="flex justify-center">
        <Button onClick={() => setCurrentIndex(0)}>Start Over</Button>
      </div>
    </div>
  );
};

export default Vocabulary;
