import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Pause, Volume2, Languages } from "lucide-react";
import { cn } from "@/lib/utils";
import ProgressBar from "@/components/ProgressBar";
import { Separator } from "@/components/ui/separator";

interface DialogueContent {
  id: number;
  content: string;
  translation: string;
  furigana: string;
  audioUrl: string;
}

const Dialogue = () => {
  const [playingAudio, setPlayingAudio] = useState<Record<number, HTMLAudioElement | null>>({});
  const [isPlaying, setIsPlaying] = useState<Record<number, boolean>>({});
  const [showTranslations, setShowTranslations] = useState<Record<number, boolean>>({});

  const { data: dialogue, isLoading } = useQuery({
    queryKey: ["lessons", "dialogue"],
    queryFn: async () => {
      const response = await fetch("/api/lessons/dialogue");
      return response.json();
    },
  });

  const handlePlayback = (id: number, audioUrl: string) => {
    if (playingAudio[id]) {
      playingAudio[id]?.pause();
      setIsPlaying(prev => ({ ...prev, [id]: false }));
      setPlayingAudio(prev => ({ ...prev, [id]: null }));
    } else {
      // Stop any currently playing audio
      Object.values(playingAudio).forEach(audio => audio?.pause());
      setIsPlaying({});
      
      const audio = new Audio(audioUrl);
      audio.play();
      setPlayingAudio(prev => ({ ...prev, [id]: audio }));
      setIsPlaying(prev => ({ ...prev, [id]: true }));
      
      audio.onended = () => {
        setIsPlaying(prev => ({ ...prev, [id]: false }));
        setPlayingAudio(prev => ({ ...prev, [id]: null }));
      };
    }
  };

  const toggleTranslation = (id: number) => {
    setShowTranslations(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
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

      <Card className="overflow-hidden">
        <div className="border-b bg-muted/50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Languages className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Conversation</h2>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Volume2 className="h-4 w-4" />
              Play All
            </Button>
          </div>
        </div>

        <div className="divide-y p-6">
          {dialogue?.map((content: DialogueContent, index: number) => (
            <div 
              key={content.id}
              className={cn(
                "space-y-4 py-6",
                index === 0 && "pt-0",
                index === dialogue.length - 1 && "pb-0"
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="space-y-1">
                    <p className="text-2xl font-medium leading-relaxed">
                      {content.content}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {content.furigana}
                    </p>
                  </div>
                  
                  {/* Translation toggle and text */}
                  <div className="pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleTranslation(content.id)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {showTranslations[content.id] ? "Hide" : "Show"} Translation
                    </Button>
                    {showTranslations[content.id] && (
                      <p className="mt-2 text-lg text-muted-foreground">
                        {content.translation}
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  size="lg"
                  variant="secondary"
                  className={cn(
                    "h-14 w-14 rounded-full transition-all",
                    isPlaying[content.id] && "bg-primary text-primary-foreground hover:bg-primary/90"
                  )}
                  onClick={() => handlePlayback(content.id, content.audioUrl)}
                >
                  {isPlaying[content.id] ? (
                    <Pause className="h-6 w-6" />
                  ) : (
                    <Play className="h-6 w-6" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex justify-center space-x-4">
        <Button variant="outline">Practice Again</Button>
        <Button>Next Section</Button>
      </div>
    </div>
  );
};

export default Dialogue;
