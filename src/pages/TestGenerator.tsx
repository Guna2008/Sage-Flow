import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FileText, Play, RotateCcw, CheckCircle2, XCircle } from "lucide-react";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
}

interface TestResult {
  questionId: number;
  selectedIndex: number | null;
  correct: boolean;
}

const stopWords = new Set([
  "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did", "will", "would", "could",
  "should", "may", "might", "shall", "can", "need", "dare", "ought",
  "used", "to", "of", "in", "for", "on", "with", "at", "by", "from",
  "as", "into", "through", "during", "before", "after", "above", "below",
  "between", "out", "off", "over", "under", "again", "further", "then",
  "once", "here", "there", "when", "where", "why", "how", "all", "each",
  "every", "both", "few", "more", "most", "other", "some", "such", "no",
  "nor", "not", "only", "own", "same", "so", "than", "too", "very", "just",
  "because", "but", "and", "or", "if", "while", "that", "this", "it", "its",
  "they", "them", "their", "we", "us", "our", "you", "your", "he", "him",
  "his", "she", "her", "i", "me", "my", "which", "what", "who", "whom",
]);

function generateQuestions(text: string, count: number): Question[] {
  const sentences = text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 40 && s.split(/\s+/).length >= 10);

  if (sentences.length === 0) return [];

  const questions: Question[] = [];

  const shuffled = sentences
    .map((s, i) => ({ s, i }))
    .sort(() => Math.random() - 0.5);

  for (const { s } of shuffled) {
    if (questions.length >= count) break;

    const words = s.split(/\s+/);
    if (words.length < 10) continue;

    // Find important nouns/concepts (capitalized or longer words)
    const candidates = words.filter(
      (w, idx) => 
        (w.length > 5 || /^[A-Z]/.test(w)) && 
        !stopWords.has(w.toLowerCase().replace(/[^a-z]/g, "")) &&
        idx > 2 && idx < words.length - 2
    );
    
    if (candidates.length === 0) continue;

    const keyword = candidates[Math.floor(Math.random() * candidates.length)];
    const cleanKeyword = keyword.replace(/[^a-zA-Z]/g, "");
    if (cleanKeyword.length < 4) continue;
    
    // Create contextual questions
    const keywordIndex = words.findIndex(w => w.includes(cleanKeyword));
    const before = words.slice(0, keywordIndex).join(" ");
    const after = words.slice(keywordIndex + 1).join(" ");
    
    const question = `${before} ______ ${after}`;

    // Generate contextual distractors from the same text
    const allWords = text
      .toLowerCase()
      .replace(/[^a-z\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 5 && !stopWords.has(w));
    
    const uniqueWords = [...new Set(allWords)];
    const distractors = uniqueWords
      .filter((w) => w !== cleanKeyword.toLowerCase() && Math.abs(w.length - cleanKeyword.length) <= 3)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    if (distractors.length < 3) {
      // Fallback distractors
      const fallbacks = uniqueWords.filter((w) => w !== cleanKeyword.toLowerCase()).slice(0, 3);
      if (fallbacks.length < 3) continue;
      distractors.push(...fallbacks.slice(0, 3 - distractors.length));
    }

    const options = [...distractors.slice(0, 3), cleanKeyword.toLowerCase()].sort(() => Math.random() - 0.5);
    const correctIndex = options.indexOf(cleanKeyword.toLowerCase());

    questions.push({ id: questions.length, question, options, correctIndex });
  }

  return questions;
}

const TestGenerator = () => {
  const [paragraph, setParagraph] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [results, setResults] = useState<TestResult[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [selected, setSelected] = useState<Record<number, number>>({});

  const handleGenerate = () => {
    if (!paragraph.trim()) return;
    const qs = generateQuestions(paragraph, numQuestions);
    setQuestions(qs);
    setResults([]);
    setSubmitted(false);
    setSelected({});
  };

  const handleSelect = (qId: number, optIndex: number) => {
    if (submitted) return;
    setSelected((prev) => ({ ...prev, [qId]: optIndex }));
  };

  const handleSubmit = () => {
    const res = questions.map((q) => ({
      questionId: q.id,
      selectedIndex: selected[q.id] ?? null,
      correct: selected[q.id] === q.correctIndex,
    }));
    setResults(res);
    setSubmitted(true);

    // Save score to localStorage for analytics
    const scores = JSON.parse(localStorage.getItem("testScores") || "[]");
    const correct = res.filter((r) => r.correct).length;
    scores.push({ date: new Date().toISOString(), score: correct, total: questions.length });
    localStorage.setItem("testScores", JSON.stringify(scores));
  };

  const handleReset = () => {
    setQuestions([]);
    setResults([]);
    setSubmitted(false);
    setSelected({});
  };

  const score = results.filter((r) => r.correct).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">MCQ Test Generator</h1>
        <p className="text-muted-foreground mt-1">Paste a paragraph to auto-generate fill-in-the-blank questions.</p>
      </div>

      {questions.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="w-5 h-5 text-primary" /> Input Paragraph
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Paste your study material here... (at least a few sentences)"
              value={paragraph}
              onChange={(e) => setParagraph(e.target.value)}
              className="min-h-[160px]"
            />
            <div className="flex items-end gap-4">
              <div className="space-y-1.5">
                <Label>Number of questions</Label>
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(Number(e.target.value))}
                  className="w-24"
                />
              </div>
              <Button onClick={handleGenerate} disabled={!paragraph.trim()}>
                <Play className="w-4 h-4 mr-1" /> Generate
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {submitted && (
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="py-4 flex items-center justify-between">
                <p className="text-lg font-semibold text-foreground">
                  Score: {score}/{questions.length} ({Math.round((score / questions.length) * 100)}%)
                </p>
                <Button variant="outline" onClick={handleReset}>
                  <RotateCcw className="w-4 h-4 mr-1" /> New Test
                </Button>
              </CardContent>
            </Card>
          )}

          {questions.map((q, qi) => {
            const result = results.find((r) => r.questionId === q.id);
            return (
              <Card key={q.id} className={submitted ? (result?.correct ? "border-green-500/40" : "border-destructive/40") : ""}>
                <CardContent className="pt-5 space-y-3">
                  <p className="font-medium text-foreground">
                    <Badge variant="secondary" className="mr-2">Q{qi + 1}</Badge>
                    {q.question}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt, oi) => {
                      const isSelected = selected[q.id] === oi;
                      const isCorrect = q.correctIndex === oi;
                      let cls = "border rounded-lg px-4 py-2.5 text-sm cursor-pointer transition-colors text-left w-full ";
                      if (submitted) {
                        if (isCorrect) cls += "bg-green-500/10 border-green-500/50 text-foreground";
                        else if (isSelected && !isCorrect) cls += "bg-destructive/10 border-destructive/50 text-foreground";
                        else cls += "border-border text-muted-foreground";
                      } else {
                        cls += isSelected
                          ? "bg-primary/10 border-primary text-foreground"
                          : "border-border text-foreground hover:bg-muted";
                      }
                      return (
                        <button key={oi} className={cls} onClick={() => handleSelect(q.id, oi)}>
                          <span className="flex items-center gap-2">
                            {submitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />}
                            {submitted && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-destructive shrink-0" />}
                            {opt}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {!submitted && (
            <Button onClick={handleSubmit} className="w-full" size="lg">
              Submit Answers
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default TestGenerator;
