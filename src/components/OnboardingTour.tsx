import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

interface OnboardingStep {
  title: string;
  description: string;
  image?: string;
}

const steps: OnboardingStep[] = [
  {
    title: "Welcome to Sage Flow! 🎉",
    description: "Let's take a quick tour to help you get started with managing your studies effectively."
  },
  {
    title: "Dashboard Overview 📊",
    description: "Your dashboard shows a summary of tasks, study hours, and upcoming exams. Check here daily to stay on track."
  },
  {
    title: "Task Management ✅",
    description: "Create tasks with priority levels (Low, Medium, High). Set due dates and mark them complete when done. Keep track of everything you need to do."
  },
  {
    title: "Study Planner 📅",
    description: "Add subjects and exam dates. Break subjects into topics with study hours. Click 'Generate Schedule' to auto-create your study plan. Drag and drop sessions between days to reschedule!"
  },
  {
    title: "Test Generator 📝",
    description: "Paste your study material and generate practice tests. Get instant feedback on your answers and track your progress over time."
  },
  {
    title: "Pomodoro Timer ⏱️",
    description: "Stay focused with timed work sessions. Customize work and break intervals. The timer automatically switches between work and rest periods."
  },
  {
    title: "Flashcards 🎴",
    description: "Create decks for different subjects. Add cards with questions and answers. Click to flip cards while studying. Shuffle for varied practice."
  },
  {
    title: "Analytics 📈",
    description: "View your study statistics, task completion rates, and test score trends. Identify areas that need more attention."
  },
  {
    title: "You're All Set! 🚀",
    description: "Start by adding your first task or creating a study plan. Remember: consistency is key to success!"
  }
];

export const OnboardingTour = () => {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem("hasSeenOnboarding");
    if (!hasSeenTour) {
      setOpen(true);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    localStorage.setItem("hasSeenOnboarding", "true");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl">{steps[currentStep].title}</DialogTitle>
        </DialogHeader>
        
        <div className="py-6">
          <p className="text-muted-foreground leading-relaxed">
            {steps[currentStep].description}
          </p>
        </div>

        <div className="flex gap-2 justify-center mb-4">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-2 rounded-full transition-all ${
                index === currentStep ? "bg-primary w-8" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          <Button variant="ghost" onClick={handleSkip}>
            Skip Tour
          </Button>
          <Button onClick={handleNext}>
            {currentStep === steps.length - 1 ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Get Started
              </>
            ) : (
              "Next"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
