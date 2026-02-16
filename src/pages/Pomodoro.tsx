import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Play, Pause, RotateCcw, Settings, Coffee, Brain } from "lucide-react";

type Mode = "work" | "shortBreak" | "longBreak";

const Pomodoro = () => {
  const [workMin, setWorkMin] = useState(() => Number(localStorage.getItem("pomo_work") || 25));
  const [shortBreakMin, setShortBreakMin] = useState(() => Number(localStorage.getItem("pomo_short") || 5));
  const [longBreakMin, setLongBreakMin] = useState(() => Number(localStorage.getItem("pomo_long") || 15));
  const [sessionsBeforeLong, setSessionsBeforeLong] = useState(() => Number(localStorage.getItem("pomo_sessions") || 4));
  const [autoStart, setAutoStart] = useState(() => localStorage.getItem("pomo_auto") === "true");

  const [mode, setMode] = useState<Mode>("work");
  const [secondsLeft, setSecondsLeft] = useState(workMin * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const getDuration = useCallback((m: Mode) => {
    if (m === "work") return workMin * 60;
    if (m === "shortBreak") return shortBreakMin * 60;
    return longBreakMin * 60;
  }, [workMin, shortBreakMin, longBreakMin]);

  useEffect(() => {
    localStorage.setItem("pomo_work", String(workMin));
    localStorage.setItem("pomo_short", String(shortBreakMin));
    localStorage.setItem("pomo_long", String(longBreakMin));
    localStorage.setItem("pomo_sessions", String(sessionsBeforeLong));
    localStorage.setItem("pomo_auto", String(autoStart));
  }, [workMin, shortBreakMin, longBreakMin, sessionsBeforeLong, autoStart]);

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current!);
          handleSessionEnd();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning]);

  const handleSessionEnd = () => {
    setIsRunning(false);
    if (mode === "work") {
      const next = completedSessions + 1;
      setCompletedSessions(next);
      const isLong = next % sessionsBeforeLong === 0;
      const nextMode = isLong ? "longBreak" : "shortBreak";
      setMode(nextMode);
      setSecondsLeft(getDuration(nextMode));
      if (autoStart) setTimeout(() => setIsRunning(true), 500);
    } else {
      setMode("work");
      setSecondsLeft(getDuration("work"));
      if (autoStart) setTimeout(() => setIsRunning(true), 500);
    }
  };

  const switchMode = (m: Mode) => {
    setIsRunning(false);
    setMode(m);
    setSecondsLeft(getDuration(m));
  };

  const reset = () => {
    setIsRunning(false);
    setSecondsLeft(getDuration(mode));
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const total = getDuration(mode);
  const progress = ((total - secondsLeft) / total) * 100;

  const modeConfig = {
    work: { label: "Focus", icon: Brain, color: "text-primary" },
    shortBreak: { label: "Short Break", icon: Coffee, color: "text-chart-3" },
    longBreak: { label: "Long Break", icon: Coffee, color: "text-chart-2" },
  };

  const current = modeConfig[mode];

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Pomodoro Timer</h1>
        <p className="text-muted-foreground mt-1">Stay focused with timed work sessions.</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          {/* Mode tabs */}
          <div className="flex gap-2 justify-center mb-8">
            {(["work", "shortBreak", "longBreak"] as Mode[]).map((m) => (
              <Button
                key={m}
                variant={mode === m ? "default" : "outline"}
                size="sm"
                onClick={() => switchMode(m)}
              >
                {modeConfig[m].label}
              </Button>
            ))}
          </div>

          {/* Timer display */}
          <div className="flex flex-col items-center gap-6">
            <div className="relative w-56 h-56 flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 224 224">
                <circle cx="112" cy="112" r="100" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                <circle
                  cx="112" cy="112" r="100" fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 100}
                  strokeDashoffset={2 * Math.PI * 100 * (1 - progress / 100)}
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>
              <div className="text-center z-10">
                <current.icon className={`w-6 h-6 mx-auto mb-1 ${current.color}`} />
                <span className="text-5xl font-mono font-bold text-foreground">
                  {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                </span>
                <p className="text-sm text-muted-foreground mt-1">{current.label}</p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              <Button size="icon" variant="outline" onClick={reset}>
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button size="lg" onClick={() => setIsRunning(!isRunning)} className="px-8">
                {isRunning ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
                {isRunning ? "Pause" : "Start"}
              </Button>
              <Button size="icon" variant="outline" onClick={() => setShowSettings(!showSettings)}>
                <Settings className="w-4 h-4" />
              </Button>
            </div>

            {/* Session counter */}
            <div className="flex items-center gap-2">
              {Array.from({ length: sessionsBeforeLong }).map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    i < (completedSessions % sessionsBeforeLong) ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
              <span className="text-xs text-muted-foreground ml-2">
                {completedSessions} sessions done
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      {showSettings && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Timer Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Focus Duration</Label>
                <span className="text-sm font-medium text-foreground">{workMin} min</span>
              </div>
              <Slider value={[workMin]} onValueChange={([v]) => { setWorkMin(v); if (mode === "work" && !isRunning) setSecondsLeft(v * 60); }} min={5} max={60} step={5} />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Short Break</Label>
                <span className="text-sm font-medium text-foreground">{shortBreakMin} min</span>
              </div>
              <Slider value={[shortBreakMin]} onValueChange={([v]) => { setShortBreakMin(v); if (mode === "shortBreak" && !isRunning) setSecondsLeft(v * 60); }} min={1} max={15} step={1} />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Long Break</Label>
                <span className="text-sm font-medium text-foreground">{longBreakMin} min</span>
              </div>
              <Slider value={[longBreakMin]} onValueChange={([v]) => { setLongBreakMin(v); if (mode === "longBreak" && !isRunning) setSecondsLeft(v * 60); }} min={5} max={30} step={5} />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Sessions before long break</Label>
                <span className="text-sm font-medium text-foreground">{sessionsBeforeLong}</span>
              </div>
              <Slider value={[sessionsBeforeLong]} onValueChange={([v]) => setSessionsBeforeLong(v)} min={2} max={8} step={1} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Auto-start next session</Label>
              <Switch checked={autoStart} onCheckedChange={setAutoStart} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Pomodoro;