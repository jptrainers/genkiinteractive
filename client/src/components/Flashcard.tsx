import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface FlashcardProps {
  front: string;
  back: string;
  furigana?: string;
}

const Flashcard = ({ front, back, furigana }: FlashcardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="perspective-1000 relative h-48 w-full cursor-pointer">
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={isFlipped ? "back" : "front"}
          initial={{ 
            opacity: 0,
            rotateX: isFlipped ? 90 : -90
          }}
          animate={{ 
            opacity: 1,
            rotateX: 0
          }}
          exit={{ 
            opacity: 0,
            rotateX: isFlipped ? -90 : 90
          }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          onClick={() => setIsFlipped(!isFlipped)}
          className="absolute h-full w-full"
          style={{ 
            transformStyle: "preserve-3d",
            backfaceVisibility: "hidden"
          }}
        >
          <Card className="flex h-full flex-col items-center justify-center p-6">
            {isFlipped ? (
              <div className="text-center">
                <p className="text-2xl font-bold">{back}</p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-3xl font-bold">{front}</p>
                {furigana && (
                  <p className="mt-2 text-sm text-muted-foreground">{furigana}</p>
                )}
              </div>
            )}
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Flashcard;
