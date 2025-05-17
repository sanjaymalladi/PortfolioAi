
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="rounded-full border-2 border-primary/20 bg-background hover:bg-accent hover:text-accent-foreground transition-all"
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
