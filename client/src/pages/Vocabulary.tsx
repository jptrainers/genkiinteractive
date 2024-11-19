import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Flashcard from "@/components/Flashcard";
import ProgressBar from "@/components/ProgressBar";

interface VocabWord {
  id: number;
  content: string;
  translation: string;
  furigana: string;
  category?: string;
}

const categories = [
  "All",
  "School Terms",
  "Person Terms",
  "Time Terms",
  "Countries",
  "Majors",
  "Occupations",
  "Family",
];

const Vocabulary = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [filteredVocabulary, setFilteredVocabulary] = useState<VocabWord[]>([]);

  const { data: vocabulary, isLoading } = useQuery({
    queryKey: ["lessons", "vocabulary"],
    queryFn: async () => {
      const response = await fetch("/api/lessons/vocabulary");
      return response.json();
    },
  });

  useEffect(() => {
    if (vocabulary) {
      const filtered = selectedCategory === "All"
        ? vocabulary
        : vocabulary.filter((word: VocabWord) => word.category === selectedCategory);
      setFilteredVocabulary(filtered);
      setCurrentIndex(0); // Reset index when category changes
    }
  }, [selectedCategory, vocabulary]);

  const handleNext = () => {
    if (filteredVocabulary && currentIndex < filteredVocabulary.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
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

      <div className="mx-auto w-72">
        <Select
          value={selectedCategory}
          onValueChange={handleCategoryChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ProgressBar 
        value={currentIndex + 1} 
        max={filteredVocabulary?.length || 1} 
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
          {filteredVocabulary && filteredVocabulary[currentIndex] && (
            <Flashcard
              front={filteredVocabulary[currentIndex].content}
              back={filteredVocabulary[currentIndex].translation}
              furigana={filteredVocabulary[currentIndex].furigana}
            />
          )}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={handleNext}
          disabled={!filteredVocabulary || currentIndex === filteredVocabulary.length - 1}
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
