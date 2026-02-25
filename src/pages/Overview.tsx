import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckSquare, BarChart3, CalendarDays, Clock, FileCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { OnboardingTour } from "@/components/OnboardingTour";

const Overview = () => {
  const { user } = useAuth();

  const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
  const studyPlan = JSON.parse(localStorage.getItem("studySubjects") || "[]");
  const testScores = JSON.parse(localStorage.getItem("testScores") || "[]");
  const completedTasks = tasks.filter((t: any) => t.completed).length;
  
  const avgScore = testScores.length > 0 
    ? Math.round((testScores.reduce((sum: number, t: any) => sum + (t.score / t.total * 100), 0) / testScores.length))
    : 0;
  const testScore = testScores.length > 0 ? `${avgScore}%` : "No tests";

  const cards = [
    { title: "Total Tasks", value: tasks.length, icon: CheckSquare, link: "/dashboard/tasks", color: "text-primary" },
    { title: "Completed", value: completedTasks, icon: Clock, link: "/dashboard/tasks", color: "text-success" },
    { title: "Subjects", value: studyPlan.length, icon: CalendarDays, link: "/dashboard/study-planner", color: "text-chart-3" },
    { title: "Avg Test Score", value: testScore, icon: FileCheck, link: "/dashboard/test-generator", color: "text-accent" },
  ];

  return (
    <>
      <OnboardingTour />
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Welcome back, {user?.name?.split(" ")[0]}!</h1>
          <p className="text-muted-foreground mt-1">Here's your study overview.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((c) => (
            <Link key={c.title} to={c.link}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{c.title}</CardTitle>
                  <c.icon className={`w-5 h-5 ${c.color}`} />
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-foreground">{c.value}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default Overview;
