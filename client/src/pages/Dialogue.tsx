import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Pause, RotateCw } from "lucide-react";
import ProgressBar from "@/components/ProgressBar";

interface DialogueContent {
  id: number;
  content: string;
  translation: string;
  furigana: string;
  audioUrl: string;
}

const Dialogue = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  const { data: dialogue, isLoading } = useQuery({
    queryKey: ["lessons", "dialogue"],
    queryFn: async () => {
      const response = await fetch("/api/lessons/dialogue");
      return response.json();
    },
  });

  const handlePlayback = (audioUrl: string) => {
    if (currentAudio) {
      currentAudio.pause();
    }
    
    if (!isPlaying) {
      const audio = new Audio(audioUrl);
      audio.play();
      setCurrentAudio(audio);
      audio.onended = () => setIsPlaying(false);
    } else {
      currentAudio?.pause();
    }
    
    setIsPlaying(!isPlaying);
  };

  if (isLoading) {
    return <div>Loading dialogue...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Dialogue Practice</h1>
        <p className="mt-2 text-muted-foreground">
          Listen and learn from real conversations
        </p>
      </div>

      <ProgressBar value={1} max={5} />

      <Card className="p-6">
        <Tabs defaultValue="japanese" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="japanese">Japanese</TabsTrigger>
            <TabsTrigger value="english">English</TabsTrigger>
          </TabsList>
          
          {dialogue?.map((content: DialogueContent) => (
            <div key={content.id} className="mt-4">
              <TabsContent value="japanese" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-semibold">{content.content}</p>
                    <p className="text-sm text-muted-foreground">
                      {content.furigana}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePlayback(content.audioUrl)}
                  >
                    {isPlaying ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="english">
                <p className="text-lg">{content.translation}</p>
              </TabsContent>
            </div>
          ))}
        </Tabs>
      </Card>

      <div className="flex justify-center space-x-4">
        <Button variant="outline">
          <RotateCw className="mr-2 h-4 w-4" />
          Practice Again
        </Button>
        <Button>Next Section</Button>
      </div>
    </div>
  );
};

export default Dialogue;
