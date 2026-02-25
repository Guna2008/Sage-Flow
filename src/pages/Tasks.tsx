import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { HelpTooltip } from "@/components/HelpTooltip";

interface Task {
  id: string;
  title: string;
  priority: "low" | "medium" | "high";
  completed: boolean;
  createdAt: string;
}

const priorityColors: Record<string, string> = {
  low: "bg-success/15 text-success",
  medium: "bg-warning/15 text-warning",
  high: "bg-destructive/15 text-destructive",
};

const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const { toast } = useToast();

  useEffect(() => {
    setTasks(JSON.parse(localStorage.getItem("tasks") || "[]"));
  }, []);

  const save = (updated: Task[]) => {
    setTasks(updated);
    localStorage.setItem("tasks", JSON.stringify(updated));
  };

  const addTask = () => {
    if (!title.trim()) return;
    const newTask: Task = { id: Date.now().toString(), title: title.trim(), priority, completed: false, createdAt: new Date().toISOString() };
    save([newTask, ...tasks]);
    setTitle("");
    toast({ title: "Task added" });
  };

  const toggleTask = (id: string) => save(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  const deleteTask = (id: string) => save(tasks.filter((t) => t.id !== id));

  const filtered = tasks.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Tasks
          <HelpTooltip content="Create tasks with priority levels. Check them off when complete. Use filters to view active or completed tasks." />
        </h1>
        <p className="text-muted-foreground mt-1">Manage your study tasks and to-dos.</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input placeholder="Add a new task..." value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addTask()} className="flex-1" />
            <div className="flex gap-3">
              <Select value={priority} onValueChange={(v: any) => setPriority(v)}>
                <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={addTask}><Plus className="w-4 h-4 mr-1" /> Add</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        {(["all", "active", "completed"] as const).map((f) => (
          <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)} className="capitalize">
            {f}
          </Button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && (
          <Card><CardContent className="py-8 text-center text-muted-foreground">No tasks found. Add one above!</CardContent></Card>
        )}
        {filtered.map((task) => (
          <Card key={task.id} className={task.completed ? "opacity-60" : ""}>
            <CardContent className="py-3 flex items-center gap-3">
              <Checkbox checked={task.completed} onCheckedChange={() => toggleTask(task.id)} />
              <span className={`flex-1 text-sm ${task.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>{task.title}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColors[task.priority]}`}>{task.priority}</span>
              <Button variant="ghost" size="icon" onClick={() => deleteTask(task.id)} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Tasks;
