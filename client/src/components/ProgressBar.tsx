import { Progress } from "@/components/ui/progress";

interface ProgressBarProps {
  value: number;
  max: number;
}

const ProgressBar = ({ value, max }: ProgressBarProps) => {
  const percentage = (value / max) * 100;

  return (
    <div className="w-full">
      <Progress value={percentage} className="h-2" />
      <p className="mt-2 text-sm text-muted-foreground">
        Progress: {value}/{max} completed
      </p>
    </div>
  );
};

export default ProgressBar;
