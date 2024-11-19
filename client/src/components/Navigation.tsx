import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Book, BookOpen, GraduationCap, Play, Globe } from "lucide-react";

const Navigation = () => {
  const [location] = useLocation();

  const navItems = [
    { href: "/dialogue", label: "Dialogue", icon: Book },
    { href: "/vocabulary", label: "Vocabulary", icon: BookOpen },
    { href: "/grammar", label: "Grammar", icon: GraduationCap },
    { href: "/practice", label: "Practice", icon: Play },
    { href: "/culture", label: "Culture", icon: Globe },
  ];

  return (
    <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-14 items-center">
        <Link href="/">
          <a className="mr-6 flex items-center space-x-2">
            <span className="font-bold">Genki学習</span>
          </a>
        </Link>
        <NavigationMenu>
          <NavigationMenuList>
            {navItems.map(({ href, label, icon: Icon }) => (
              <NavigationMenuItem key={href}>
                <Link href={href}>
                  <NavigationMenuLink
                    className={cn(
                      "group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                      location === href && "bg-accent text-accent-foreground"
                    )}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {label}
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </header>
  );
};

export default Navigation;
