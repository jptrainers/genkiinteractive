import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import ProgressBar from "@/components/ProgressBar";

interface Question {
  id: number;
  type: "multiple-choice" | "fill-in";
  question: string;
  options?: string[];
  correctAnswer: string;
}

const Practice = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const { toast } = useToast();

  const { data: questions, isLoading } = useQuery({
    queryKey: ["lessons", "practice"],
    queryFn: async () => {
      const response = await fetch("/api/lessons/practice");
      return response.json();
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
          score: data.answer === questions[currentQuestion].correctAnswer ? 1 : 0,
        }),
      });
      return response.json();
    },
    onSuccess: () => {
      const isCorrect = 
        answers[currentQuestion] === questions[currentQuestion].correctAnswer;
      
      toast({
        title: isCorrect ? "Correct!" : "Incorrect",
        description: isCorrect 
          ? "Great job! Let's move to the next question."
          : `The correct answer was: ${questions[currentQuestion].correctAnswer}`,
        variant: isCorrect ? "default" : "destructive",
      });

      if (currentQuestion < questions?.length - 1) {
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

    submitMutation.mutate({
      questionId: questions[currentQuestion].id,
      answer: answers[currentQuestion],
    });
  };

  if (isLoading) {
    return <div>Loading practice questions...</div>;
  }

  const question = questions[currentQuestion];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Practice</h1>
        <p className="mt-2 text-muted-foreground">
          Test your knowledge of Lesson 1
        </p>
      </div>

      <ProgressBar 
        value={currentQuestion + 1} 
        max={questions?.length || 1} 
      />

      <Card className="p-6">
        <h2 className="mb-6 text-xl font-semibold">{question?.question}</h2>

        {question?.type === "multiple-choice" ? (
          <RadioGroup
            onValueChange={(value) => 
              setAnswers({ ...answers, [currentQuestion]: value })
            }
            value={answers[currentQuestion]}
          >
            {question.options?.map((option, index) => (
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
            placeholder="Type your answer here..."
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
            {currentQuestion === questions.length - 1 ? "Finish" : "Next"}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Practice;
