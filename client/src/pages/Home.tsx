import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Book, BookOpen, GraduationCap, Play, Globe } from "lucide-react";

const Home = () => {
  const sections = [
    {
      title: "Dialogue",
      description: "Learn through conversation",
      icon: Book,
      href: "/dialogue",
      color: "bg-red-100",
    },
    {
      title: "Vocabulary",
      description: "Master new words",
      icon: BookOpen,
      href: "/vocabulary",
      color: "bg-blue-100",
    },
    {
      title: "Grammar",
      description: "Understand the rules",
      icon: GraduationCap,
      href: "/grammar",
      color: "bg-green-100",
    },
    {
      title: "Practice",
      description: "Test your knowledge",
      icon: Play,
      href: "/practice",
      color: "bg-yellow-100",
    },
    {
      title: "Culture",
      description: "Explore Japan",
      icon: Globe,
      href: "/culture",
      color: "bg-purple-100",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Welcome to Genki Lesson 1</h1>
        <p className="mt-2 text-muted-foreground">
          Start your journey to learning Japanese
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map(({ title, description, icon: Icon, href, color }) => (
          <Link key={href} href={href}>
            <Card
              className={`cursor-pointer p-6 transition-all hover:scale-105 ${color}`}
            >
              <div className="flex items-center space-x-4">
                <Icon className="h-6 w-6" />
                <div>
                  <h2 className="text-xl font-semibold">{title}</h2>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Button size="lg">Start Learning</Button>
      </div>
    </div>
  );
};

export default Home;
