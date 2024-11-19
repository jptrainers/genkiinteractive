import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import ProgressBar from "@/components/ProgressBar";
import type { Lesson } from "@db/schema";

interface Question extends Lesson {
  type: "multiple-choice" | "fill-in";
  options?: string[];
}

const GrammarPractice = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const { toast } = useToast();

  const { data: questions, isLoading } = useQuery<Question[]>({
    queryKey: ["lessons", "grammar-practice"],
    queryFn: async () => {
      const response = await fetch("/api/lessons/grammar");
      const data = await response.json();
      // Transform grammar points into practice questions
      return data.map((point: Lesson) => ({
        ...point,
        type: Math.random() > 0.5 ? "multiple-choice" : "fill-in",
        options: ["Option 1", "Option 2", "Option 3", "Option 4"],
      }));
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: { questionId: number; answer: string }) => {
      const response = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId: data.questionId,
          completed: true,
          score: data.answer === questions?.[currentQuestion].translation ? 1 : 0,
        }),
      });
      return response.json();
    },
    onSuccess: () => {
      if (!questions) return;
      
      const isCorrect = 
        answers[currentQuestion] === questions[currentQuestion].translation;
      
      toast({
        title: isCorrect ? "Correct!" : "Incorrect",
        description: isCorrect 
          ? "Great job! Let's move to the next question."
          : `The correct answer was: ${questions[currentQuestion].translation}`,
        variant: isCorrect ? "default" : "destructive",
      });

      if (currentQuestion < (questions?.length ?? 0) - 1) {
        setCurrentQuestion(currentQuestion + 1);
      }
    },
  });

  const handleSubmit = () => {
    if (!answers[currentQuestion]) {
      toast({
        title: "Please select an answer",
        variant: "destructive",
      });
      return;
    }

    if (!questions) return;

    submitMutation.mutate({
      questionId: questions[currentQuestion].id,
      answer: answers[currentQuestion],
    });
  };

  if (isLoading) {
    return <div>Loading practice questions...</div>;
  }

  const question = questions?.[currentQuestion];

  if (!question) {
    return <div>No questions available.</div>;
  }

  return (
    <div className="space-y-8">
      <ProgressBar 
        value={currentQuestion + 1} 
        max={questions?.length ?? 1} 
      />

      <Card className="p-6">
        <h2 className="mb-6 text-xl font-semibold">{question.content}</h2>

        {question.type === "multiple-choice" ? (
          <RadioGroup
            onValueChange={(value) => 
              setAnswers({ ...answers, [currentQuestion]: value })
            }
            value={answers[currentQuestion]}
          >
            {question.options?.map((option: string, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        ) : (
          <Input
            value={answers[currentQuestion] || ""}
            onChange={(e) => 
              setAnswers({ ...answers, [currentQuestion]: e.target.value })
            }
            placeholder="Type your answer in Japanese..."
          />
        )}

        <div className="mt-6 flex justify-end space-x-4">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>
          <Button onClick={handleSubmit}>
            {currentQuestion === (questions?.length ?? 0) - 1 ? "Finish" : "Next"}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default GrammarPractice;
