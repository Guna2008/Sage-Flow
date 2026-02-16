import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, differenceInDays, addDays, isToday, isBefore, startOfDay } from "date-fns";
import { CalendarIcon, Plus, Trash2, GripVertical, RotateCcw, BookOpen, Clock, AlertTriangle, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Topic {
  id: string;
  name: string;
  hoursNeeded: number;
}

interface Subject {
  id: string;
  name: string;
  topics: Topic[];
  examDate: Date;
  color: string;
}

interface ScheduleEntry {
  id: string;
  subjectId: string;
  subjectName: string;
  topicId: string;
  topicName: string;
  date: string; // ISO date string
  hours: number;
  completed: boolean;
  color: string;
}

const SUBJECT_COLORS = [
  "hsl(168, 70%, 38%)",
  "hsl(262, 60%, 55%)",
  "hsl(43, 96%, 56%)",
  "hsl(200, 70%, 50%)",
  "hsl(340, 65%, 55%)",
  "hsl(25, 80%, 55%)",
];

const COLOR_CLASSES = [
  "bg-primary/15 border-primary/30 text-primary",
  "bg-chart-3/15 border-chart-3/30 text-chart-3",
  "bg-accent/15 border-accent/30 text-accent-foreground",
  "bg-chart-4/15 border-chart-4/30 text-chart-4",
  "bg-chart-5/15 border-chart-5/30 text-chart-5",
  "bg-warning/15 border-warning/30 text-warning",
];

const StudyPlanner = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [hoursPerDay, setHoursPerDay] = useState(4);
  const [newSubject, setNewSubject] = useState("");
  const [newTopicName, setNewTopicName] = useState("");
  const [newTopicHours, setNewTopicHours] = useState("2");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [examDate, setExamDate] = useState<Date>();
  const [dragItem, setDragItem] = useState<string | null>(null);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const stored = localStorage.getItem("studySubjects");
    const storedSchedule = localStorage.getItem("studySchedule");
    const storedHours = localStorage.getItem("studyHoursPerDay");
    if (stored) setSubjects(JSON.parse(stored).map((s: any) => ({ ...s, examDate: new Date(s.examDate) })));
    if (storedSchedule) setSchedule(JSON.parse(storedSchedule));
    if (storedHours) setHoursPerDay(parseInt(storedHours));
  }, []);

  const save = useCallback((subs: Subject[], sched: ScheduleEntry[], hours: number) => {
    localStorage.setItem("studySubjects", JSON.stringify(subs));
    localStorage.setItem("studySchedule", JSON.stringify(sched));
    localStorage.setItem("studyHoursPerDay", hours.toString());
  }, []);

  const addSubject = () => {
    if (!newSubject.trim() || !examDate) {
      toast({ title: "Missing info", description: "Enter subject name and exam date", variant: "destructive" });
      return;
    }
    const sub: Subject = {
      id: crypto.randomUUID(),
      name: newSubject.trim(),
      topics: [],
      examDate,
      color: SUBJECT_COLORS[subjects.length % SUBJECT_COLORS.length],
    };
    const updated = [...subjects, sub];
    setSubjects(updated);
    save(updated, schedule, hoursPerDay);
    setNewSubject("");
    setExamDate(undefined);
    toast({ title: "Subject added", description: `${sub.name} added with exam on ${format(sub.examDate, "PP")}` });
  };

  const removeSubject = (id: string) => {
    const updated = subjects.filter((s) => s.id !== id);
    const updatedSchedule = schedule.filter((e) => e.subjectId !== id);
    setSubjects(updated);
    setSchedule(updatedSchedule);
    save(updated, updatedSchedule, hoursPerDay);
  };

  const addTopic = (subjectId: string) => {
    if (!newTopicName.trim()) return;
    const topic: Topic = { id: crypto.randomUUID(), name: newTopicName.trim(), hoursNeeded: parseFloat(newTopicHours) || 2 };
    const updated = subjects.map((s) => s.id === subjectId ? { ...s, topics: [...s.topics, topic] } : s);
    setSubjects(updated);
    save(updated, schedule, hoursPerDay);
    setNewTopicName("");
    setNewTopicHours("2");
  };

  const removeTopic = (subjectId: string, topicId: string) => {
    const updated = subjects.map((s) => s.id === subjectId ? { ...s, topics: s.topics.filter((t) => t.id !== topicId) } : s);
    const updatedSchedule = schedule.filter((e) => e.topicId !== topicId);
    setSubjects(updated);
    setSchedule(updatedSchedule);
    save(updated, updatedSchedule, hoursPerDay);
  };

  const generateSchedule = () => {
    const allTopics = subjects.flatMap((s) =>
      s.topics.map((t) => ({ ...t, subjectId: s.id, subjectName: s.name, examDate: s.examDate, color: s.color, colorIndex: subjects.indexOf(s) }))
    );
    if (allTopics.length === 0) {
      toast({ title: "No topics", description: "Add subjects and topics first", variant: "destructive" });
      return;
    }

    // Sort by exam date (earliest first)
    allTopics.sort((a, b) => a.examDate.getTime() - b.examDate.getTime());

    const entries: ScheduleEntry[] = [];
    const today = startOfDay(new Date());
    const dateHoursUsed: Record<string, number> = {};

    for (const topic of allTopics) {
      let remainingHours = topic.hoursNeeded;
      const startDay = today;

      let currentDay = startDay;
      while (remainingHours > 0 && differenceInDays(currentDay, topic.examDate) < 0) {
        const dateKey = format(currentDay, "yyyy-MM-dd");
        const usedHours = dateHoursUsed[dateKey] || 0;
        const availableHours = Math.max(0, hoursPerDay - usedHours);

        if (availableHours > 0) {
          const allocatedHours = Math.min(remainingHours, availableHours, 2); // max 2hrs per session
          entries.push({
            id: crypto.randomUUID(),
            subjectId: topic.subjectId,
            subjectName: topic.subjectName,
            topicId: topic.id,
            topicName: topic.name,
            date: dateKey,
            hours: Math.round(allocatedHours * 10) / 10,
            completed: false,
            color: topic.color,
          });
          dateHoursUsed[dateKey] = usedHours + allocatedHours;
          remainingHours -= allocatedHours;
        }
        currentDay = addDays(currentDay, 1);
      }
    }

    setSchedule(entries);
    save(subjects, entries, hoursPerDay);
    toast({ title: "Schedule generated!", description: `${entries.length} study sessions planned` });
  };

  const toggleCompleted = (entryId: string) => {
    const updated = schedule.map((e) => e.id === entryId ? { ...e, completed: !e.completed } : e);
    setSchedule(updated);
    save(subjects, updated, hoursPerDay);
  };

  const handlePrint = () => {
    window.print();
  };

  const rescheduleMissed = () => {
    const today = startOfDay(new Date());
    const missed = schedule.filter((e) => !e.completed && isBefore(new Date(e.date), today));
    if (missed.length === 0) {
      toast({ title: "No missed sessions", description: "You're all caught up!" });
      return;
    }

    const dateHoursUsed: Record<string, number> = {};
    const kept = schedule.filter((e) => e.completed || !isBefore(new Date(e.date), today));
    kept.forEach((e) => {
      dateHoursUsed[e.date] = (dateHoursUsed[e.date] || 0) + e.hours;
    });

    const rescheduled: ScheduleEntry[] = [];
    let currentDay = today;

    for (const entry of missed) {
      let placed = false;
      let tryDay = currentDay;
      for (let attempt = 0; attempt < 60 && !placed; attempt++) {
        const dateKey = format(tryDay, "yyyy-MM-dd");
        const used = dateHoursUsed[dateKey] || 0;
        if (used + entry.hours <= hoursPerDay) {
          rescheduled.push({ ...entry, id: crypto.randomUUID(), date: dateKey });
          dateHoursUsed[dateKey] = used + entry.hours;
          placed = true;
        }
        tryDay = addDays(tryDay, 1);
      }
    }

    const updated = [...kept, ...rescheduled];
    setSchedule(updated);
    save(subjects, updated, hoursPerDay);
    toast({ title: "Rescheduled!", description: `${rescheduled.length} missed sessions moved forward` });
  };

  // Drag & Drop
  const handleDragStart = (entryId: string) => setDragItem(entryId);
  const handleDragOver = (e: React.DragEvent, dateKey: string) => { e.preventDefault(); setDragOverDate(dateKey); };
  const handleDragLeave = () => setDragOverDate(null);
  const handleDrop = (e: React.DragEvent, targetDate: string) => {
    e.preventDefault();
    setDragOverDate(null);
    if (!dragItem) return;

    const updated = schedule.map((entry) => entry.id === dragItem ? { ...entry, date: targetDate } : entry);
    setSchedule(updated);
    save(subjects, updated, hoursPerDay);
    setDragItem(null);
  };

  // Get upcoming 14 days for the timetable
  const today = startOfDay(new Date());
  const timetableDays = Array.from({ length: 14 }, (_, i) => {
    const date = addDays(today, i);
    return { date, key: format(date, "yyyy-MM-dd"), label: format(date, "EEE"), dayNum: format(date, "d MMM") };
  });

  const missedCount = schedule.filter((e) => !e.completed && isBefore(new Date(e.date), today)).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Study Planner</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">Plan your study schedule across subjects and topics.</p>
        </div>
        {missedCount > 0 && (
          <Button onClick={rescheduleMissed} variant="outline" className="gap-2 w-full sm:w-auto">
            <AlertTriangle className="w-4 h-4 text-warning" /> Reschedule {missedCount} missed
          </Button>
        )}
        {schedule.length > 0 && (
          <Button onClick={handlePrint} variant="outline" className="gap-2 w-full sm:w-auto">
            <Printer className="w-4 h-4" /> Print Schedule
          </Button>
        )}
      </div>

      {/* Add Subject */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><BookOpen className="w-5 h-5 text-primary" /> Add Subject</CardTitle>
          <CardDescription>Add a subject with its exam date, then add topics to it.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input placeholder="Subject name (e.g. Mathematics)" value={newSubject} onChange={(e) => setNewSubject(e.target.value)} className="flex-1" />
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full sm:w-[200px] justify-start text-left font-normal", !examDate && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {examDate ? format(examDate, "PP") : "Exam date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={examDate} onSelect={setExamDate} disabled={(d) => isBefore(d, today)} initialFocus className="p-3 pointer-events-auto" />
              </PopoverContent>
            </Popover>
            <Button onClick={addSubject} className="gap-2"><Plus className="w-4 h-4" /> Add</Button>
          </div>
        </CardContent>
      </Card>

      {/* Subjects & Topics */}
      {subjects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subjects.map((sub) => (
            <Card key={sub.id} className="border-l-4" style={{ borderLeftColor: sub.color }}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{sub.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">{format(sub.examDate, "PP")}</Badge>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeSubject(sub.id)}>
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{differenceInDays(sub.examDate, today)} days until exam · {sub.topics.length} topics</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {sub.topics.map((t) => (
                  <div key={t.id} className="flex items-center justify-between py-1.5 px-3 rounded-md bg-muted/50">
                    <span className="text-sm">{t.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{t.hoursNeeded}h</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeTopic(sub.id, t.id)}>
                        <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="flex gap-2 pt-1">
                  <Input placeholder="Topic name" value={selectedSubjectId === sub.id ? newTopicName : ""} onChange={(e) => { setSelectedSubjectId(sub.id); setNewTopicName(e.target.value); }} className="flex-1 h-8 text-sm" onFocus={() => setSelectedSubjectId(sub.id)} />
                  <Input type="number" placeholder="Hrs" value={selectedSubjectId === sub.id ? newTopicHours : "2"} onChange={(e) => { setSelectedSubjectId(sub.id); setNewTopicHours(e.target.value); }} className="w-16 h-8 text-sm" onFocus={() => setSelectedSubjectId(sub.id)} />
                  <Button size="sm" variant="secondary" className="h-8" onClick={() => addTopic(sub.id)}>
                    <Plus className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Generate Schedule Controls */}
      {subjects.some((s) => s.topics.length > 0) && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <Label className="text-sm whitespace-nowrap"><Clock className="w-4 h-4 inline mr-1.5" />Study hours/day:</Label>
                <Input type="number" min={1} max={12} value={hoursPerDay} onChange={(e) => { const v = parseInt(e.target.value) || 4; setHoursPerDay(v); save(subjects, schedule, v); }} className="w-20 h-9" />
              </div>
              <Button onClick={generateSchedule} className="gap-2 flex-1 sm:flex-none">
                <RotateCcw className="w-4 h-4" /> Generate Study Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timetable - Drag & Drop */}
      {schedule.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Daily Study Plan</CardTitle>
            <CardDescription>Drag sessions between days to rearrange. Click to mark complete.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {timetableDays.map(({ key, label, dayNum, date }) => {
                const dayEntries = schedule.filter((e) => e.date === key);
                const totalHours = dayEntries.reduce((sum, e) => sum + e.hours, 0);
                const isOverloaded = totalHours > hoursPerDay;

                return (
                  <div
                    key={key}
                    className={cn(
                      "rounded-lg border p-2 min-h-[120px] transition-colors",
                      isToday(date) && "border-primary/50 bg-primary/5",
                      dragOverDate === key && "border-primary bg-primary/10",
                      isOverloaded && "border-warning/50"
                    )}
                    onDragOver={(e) => handleDragOver(e, key)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, key)}
                  >
                    <div className="text-center mb-2">
                      <p className={cn("text-xs font-medium", isToday(date) ? "text-primary" : "text-muted-foreground")}>{label}</p>
                      <p className="text-sm font-semibold">{dayNum}</p>
                      {totalHours > 0 && (
                        <p className={cn("text-[10px]", isOverloaded ? "text-warning" : "text-muted-foreground")}>{totalHours}h / {hoursPerDay}h</p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      {dayEntries.map((entry) => {
                        const colorClass = COLOR_CLASSES[subjects.findIndex((s) => s.id === entry.subjectId) % COLOR_CLASSES.length] || COLOR_CLASSES[0];
                        return (
                          <div
                            key={entry.id}
                            draggable
                            onDragStart={() => handleDragStart(entry.id)}
                            onClick={() => toggleCompleted(entry.id)}
                            className={cn(
                              "p-1.5 rounded border text-[11px] cursor-grab active:cursor-grabbing transition-all",
                              colorClass,
                              entry.completed && "opacity-50 line-through"
                            )}
                          >
                            <div className="flex items-start gap-1">
                              <GripVertical className="w-3 h-3 shrink-0 mt-0.5 opacity-40" />
                              <div className="min-w-0">
                                <p className="font-medium truncate">{entry.subjectName}</p>
                                <p className="truncate opacity-75">{entry.topicName} · {entry.hours}h</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudyPlanner;
