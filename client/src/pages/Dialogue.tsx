import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Play, Pause, Volume2, Languages, User2, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import ProgressBar from "@/components/ProgressBar";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import type { Conversation, DialogueProgress } from "@db/schema";

interface DialogueContent {
  id: number;
  content: string;
  translation: string;
  furigana: string;
  audioUrl: string;
  imageUrl?: string;
  speaker: "Takeshi" | "Mary" | "タケシ" | "メアリー";
}

const Dialogue = () => {
  const [currentConversation, setCurrentConversation] = useState<string>();
  const [playingAudio, setPlayingAudio] = useState<Record<number, HTMLAudioElement | null>>({});
  const [isPlaying, setIsPlaying] = useState<Record<number, boolean>>({});
  const [showTranslations, setShowTranslations] = useState<Record<number, boolean>>({});
  const [practiceProgress, setPracticeProgress] = useState<Record<number, boolean>>({});

  // Fetch available conversations
  const { data: conversations } = useQuery<Conversation[]>({
    queryKey: ["conversations"],
    queryFn: async () => {
      const response = await fetch("/api/conversations");
      const data = await response.json();
      if (data.length > 0 && !currentConversation) {
        setCurrentConversation(data[0].id.toString());
      }
      return data;
    },
  });

  // Fetch dialogue for selected conversation
  const { data: dialogue, isLoading } = useQuery<DialogueContent[]>({
    queryKey: ["conversations", currentConversation, "dialogue"],
    queryFn: async () => {
      if (!currentConversation) return [];
      const response = await fetch(`/api/conversations/${currentConversation}/dialogue`);
      return response.json();
    },
    enabled: !!currentConversation,
  });

  // Fetch user's dialogue progress
  const { data: progress } = useQuery<DialogueProgress[]>({
    queryKey: ["dialogue-progress", 1], // TODO: Replace with actual userId
    queryFn: async () => {
      const response = await fetch("/api/dialogue-progress/1"); // TODO: Replace with actual userId
      return response.json();
    },
  });

  // Update progress mutation
  const progressMutation = useMutation({
    mutationFn: async (data: { 
      conversationId: number; 
      linesCompleted: number;
      completed: boolean;
    }) => {
      const response = await fetch("/api/dialogue-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: 1, // TODO: Replace with actual userId
          ...data,
        }),
      });
      return response.json();
    },
  });

  const handlePlayback = (id: number, audioUrl: string) => {
    if (playingAudio[id]) {
      playingAudio[id]?.pause();
      setIsPlaying(prev => ({ ...prev, [id]: false }));
      setPlayingAudio(prev => ({ ...prev, [id]: null }));
    } else {
      Object.values(playingAudio).forEach(audio => audio?.pause());
      setIsPlaying({});
      
      const audio = new Audio(audioUrl);
      audio.play();
      setPlayingAudio(prev => ({ ...prev, [id]: audio }));
      setIsPlaying(prev => ({ ...prev, [id]: true }));
      
      audio.onended = () => {
        setIsPlaying(prev => ({ ...prev, [id]: false }));
        setPlayingAudio(prev => ({ ...prev, [id]: null }));
        // Mark this line as practiced
        setPracticeProgress(prev => ({ ...prev, [id]: true }));
        
        // Update progress in the database
        if (currentConversation) {
          const practiced = Object.values(practiceProgress).filter(Boolean).length;
          progressMutation.mutate({
            conversationId: parseInt(currentConversation),
            linesCompleted: practiced,
            completed: practiced === (dialogue?.length ?? 0),
          });
        }
      };
    }
  };

  const toggleTranslation = (id: number) => {
    setShowTranslations(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const isMary = (speaker: string) => {
    return speaker === "Mary" || speaker === "メアリー";
  };

  if (isLoading) {
    return <div>Loading dialogue...</div>;
  }

  // Find unique speakers and ensure they're properly typed
  const speakers = dialogue ? Array.from(new Set(dialogue.map(d => d.speaker))) : [];
  const [takeshi, mary] = speakers as DialogueContent["speaker"][];

  // Calculate progress
  const currentProgress = progress?.find(p => 
    p.conversationId === parseInt(currentConversation ?? "0")
  );
  const totalLines = dialogue?.length ?? 0;
  const completedLines = currentProgress?.linesCompleted ?? 0;

  const selectedConversation = conversations?.find(
    c => c.id.toString() === currentConversation
  );

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Dialogue Practice</h1>
        <p className="mt-2 text-muted-foreground">
          Listen and learn from real conversations
        </p>
      </div>

      {/* Conversation Selector */}
      <div className="mx-auto w-72">
        <Select
          value={currentConversation}
          onValueChange={setCurrentConversation}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select conversation" />
          </SelectTrigger>
          <SelectContent>
            {conversations?.map((conversation) => (
              <SelectItem key={conversation.id} value={conversation.id.toString()}>
                {conversation.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ProgressBar 
        value={completedLines} 
        max={totalLines} 
      />

      {/* Situation Description Card */}
      <Card className="bg-muted/30 p-6">
        <div className="flex items-start gap-4">
          <Info className="mt-1 h-5 w-5 text-primary" />
          <div>
            <h2 className="text-xl font-semibold">Situation</h2>
            <p className="mt-2 text-muted-foreground leading-relaxed">
              {selectedConversation?.description}
            </p>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        {/* Speakers Header */}
        <div className="flex items-center justify-between border-b bg-muted/30 p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 ring-2 ring-primary ring-offset-2">
              <AvatarImage
                src={dialogue?.find(d => d.speaker === takeshi)?.imageUrl}
                alt={`${takeshi}'s profile`}
                className="object-cover"
              />
              <AvatarFallback className="bg-primary/10">
                <User2 className="h-10 w-10 text-primary" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-semibold">{takeshi}</h2>
              <p className="text-sm text-muted-foreground">Student</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <h2 className="text-2xl font-semibold">{mary}</h2>
              <p className="text-sm text-muted-foreground">Exchange Student</p>
            </div>
            <Avatar className="h-20 w-20 ring-2 ring-primary ring-offset-2">
              <AvatarImage
                src={dialogue?.find(d => d.speaker === mary)?.imageUrl}
                alt={`${mary}'s profile`}
                className="object-cover"
              />
              <AvatarFallback className="bg-primary/10">
                <User2 className="h-10 w-10 text-primary" />
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

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
          <AnimatePresence>
            {dialogue?.map((content, index) => (
              <motion.div
                key={content.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={cn(
                  "space-y-4 py-6",
                  index === 0 && "pt-0",
                  index === dialogue.length - 1 && "pb-0"
                )}
              >
                <div className={cn(
                  "flex items-start gap-4",
                  isMary(content.speaker) && "flex-row-reverse"
                )}>
                  <Avatar className="h-16 w-16 flex-shrink-0">
                    <AvatarImage
                      src={content.imageUrl}
                      alt={`${content.speaker}'s profile`}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-primary/10">
                      <User2 className="h-8 w-8 text-primary" />
                    </AvatarFallback>
                  </Avatar>

                  <div className={cn(
                    "flex-1 space-y-2",
                    isMary(content.speaker) && "text-right"
                  )}>
                    <div className={cn(
                      "flex items-start justify-between gap-4",
                      isMary(content.speaker) && "flex-row-reverse"
                    )}>
                      <div className="space-y-1">
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-2xl font-medium leading-relaxed"
                        >
                          {content.content}
                        </motion.p>
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className="text-sm text-muted-foreground"
                        >
                          {content.furigana}
                        </motion.p>
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
                    
                    {/* Translation toggle and text */}
                    <div className={cn(
                      "pt-2",
                      isMary(content.speaker) && "flex flex-col items-end"
                    )}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleTranslation(content.id)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {showTranslations[content.id] ? "Hide" : "Show"} Translation
                      </Button>
                      <AnimatePresence>
                        {showTranslations[content.id] && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-2 text-lg text-muted-foreground"
                          >
                            {content.translation}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
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