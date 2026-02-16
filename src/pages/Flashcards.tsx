import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, RotateCcw, ChevronLeft, ChevronRight, Layers, Shuffle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Flashcard {
  id: string;
  front: string;
  back: string;
  deck: string;
}

const Flashcards = () => {
  const { toast } = useToast();
  const [cards, setCards] = useState<Flashcard[]>(() =>
    JSON.parse(localStorage.getItem("flashcards") || "[]")
  );
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [deck, setDeck] = useState("General");
  const [newDeck, setNewDeck] = useState("");

  // Review state
  const [reviewDeck, setReviewDeck] = useState<string | null>(null);
  const [reviewCards, setReviewCards] = useState<Flashcard[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const decks = [...new Set(cards.map((c) => c.deck))];

  useEffect(() => {
    localStorage.setItem("flashcards", JSON.stringify(cards));
  }, [cards]);

  const addCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!front.trim() || !back.trim()) return;
    const activeDeck = newDeck.trim() || deck;
    setCards([...cards, { id: Date.now().toString(), front: front.trim(), back: back.trim(), deck: activeDeck }]);
    setFront("");
    setBack("");
    setNewDeck("");
    if (!decks.includes(activeDeck)) setDeck(activeDeck);
    toast({ title: "Card added", description: `Added to "${activeDeck}"` });
  };

  const deleteCard = (id: string) => {
    setCards(cards.filter((c) => c.id !== id));
  };

  const startReview = (deckName: string, shuffle = false) => {
    const deckCards = cards.filter((c) => c.deck === deckName);
    if (deckCards.length === 0) return;
    setReviewCards(shuffle ? [...deckCards].sort(() => Math.random() - 0.5) : deckCards);
    setReviewDeck(deckName);
    setCurrentIdx(0);
    setFlipped(false);
  };

  const exitReview = () => {
    setReviewDeck(null);
    setReviewCards([]);
    setCurrentIdx(0);
    setFlipped(false);
  };

  // Review mode
  if (reviewDeck && reviewCards.length > 0) {
    const card = reviewCards[currentIdx];
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Reviewing: {reviewDeck}</h1>
            <p className="text-muted-foreground mt-1">Card {currentIdx + 1} of {reviewCards.length}</p>
          </div>
          <Button variant="outline" onClick={exitReview} className="w-full sm:w-auto">Exit Review</Button>
        </div>

        <div
          className="cursor-pointer perspective-1000"
          onClick={() => setFlipped(!flipped)}
        >
          <Card className="min-h-[280px] flex items-center justify-center transition-all duration-300 hover:shadow-lg">
            <CardContent className="pt-6 text-center w-full">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-4">
                {flipped ? "Answer" : "Question"} — tap to flip
              </p>
              <p className="text-2xl font-semibold text-foreground leading-relaxed">
                {flipped ? card.back : card.front}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="icon"
            disabled={currentIdx === 0}
            onClick={() => { setCurrentIdx(currentIdx - 1); setFlipped(false); }}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setFlipped(!flipped)}>
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            disabled={currentIdx === reviewCards.length - 1}
            onClick={() => { setCurrentIdx(currentIdx + 1); setFlipped(false); }}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Flashcards</h1>
        <p className="text-muted-foreground mt-1">Create and review flashcards for your subjects.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Create Card</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={addCard} className="space-y-4">
              <div className="space-y-2">
                <Label>Deck</Label>
                {decks.length > 0 ? (
                  <Select value={deck} onValueChange={setDeck}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {decks.map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : null}
                <Input
                  placeholder="Or type a new deck name..."
                  value={newDeck}
                  onChange={(e) => setNewDeck(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Front (Question)</Label>
                <Textarea placeholder="What is photosynthesis?" value={front} onChange={(e) => setFront(e.target.value)} rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Back (Answer)</Label>
                <Textarea placeholder="The process by which plants convert light energy..." value={back} onChange={(e) => setBack(e.target.value)} rows={3} />
              </div>
              <Button type="submit" className="w-full">
                <Plus className="w-4 h-4 mr-2" /> Add Card
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Decks */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Your Decks</h2>
          {decks.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <Layers className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p>No flashcards yet. Create your first card!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {decks.map((d) => {
                const deckCards = cards.filter((c) => c.deck === d);
                return (
                  <Card key={d}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">{d}</CardTitle>
                      <CardDescription>{deckCards.length} card{deckCards.length !== 1 ? "s" : ""}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {deckCards.map((c) => (
                          <div key={c.id} className="flex items-center justify-between text-sm py-1 border-b border-border last:border-0">
                            <span className="truncate flex-1 text-foreground">{c.front}</span>
                            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => deleteCard(c.id)}>
                              <Trash2 className="w-3 h-3 text-destructive" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => startReview(d)} className="flex-1">
                          Review
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => startReview(d, true)}>
                          <Shuffle className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Flashcards;
