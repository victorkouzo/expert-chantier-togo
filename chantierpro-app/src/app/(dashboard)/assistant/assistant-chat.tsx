"use client";

import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send, Sparkles } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const suggestions = [
  "Quel chantier dépense le plus ?",
  "Quels sont les problèmes signalés cette semaine ?",
  "Quel est l'avancement global des chantiers ?",
];

export function AssistantChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    setError("");
    const newMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erreur");
      } else {
        setMessages([...newMessages, { role: "assistant", content: data.reply }]);
      }
    } catch {
      setError("Erreur de connexion");
    }
    setLoading(false);
  }

  return (
    <Card className="space-y-4">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
        <Sparkles size={18} className="text-green-400" /> Poser une question
      </h2>

      {messages.length === 0 ? (
        <div className="space-y-2">
          <p className="text-sm text-zinc-500">Exemples de questions :</p>
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="block w-full rounded-lg border border-zinc-800 px-3 py-2 text-left text-sm text-zinc-400 transition-colors hover:border-zinc-600 hover:text-white"
            >
              {s}
            </button>
          ))}
        </div>
      ) : (
        <div className="max-h-96 space-y-3 overflow-y-auto">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm ${
                  m.role === "user"
                    ? "bg-green-500/10 text-green-100"
                    : "bg-zinc-800 text-zinc-200"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-lg bg-zinc-800 px-3 py-2">
                <div className="flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-500" style={{ animationDelay: "0ms" }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-500" style={{ animationDelay: "150ms" }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-500" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Votre question..."
          className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <Button type="submit" loading={loading} disabled={!input.trim()}>
          <Send size={16} />
        </Button>
      </form>
    </Card>
  );
}
