import { useState, useRef, useEffect } from "react";
import { useListFaqQuestions, getListFaqQuestionsQueryKey, useAskFaq } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const SUGGESTED = [
  "What is the real-world range of Nexon EV?",
  "How long does it take to charge on a home charger?",
  "Is it safe to charge in rain?",
  "What is the battery warranty on Tata EVs?",
  "How do I activate regenerative braking?",
  "Can I use a public charger for my car?",
];

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Faq() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: faqs } = useListFaqQuestions(
    {},
    { query: { queryKey: getListFaqQuestionsQueryKey({}) } }
  );

  const askMutation = useAskFaq({
    mutation: {
      onSuccess: (data) => {
        setMessages(prev => [...prev, { role: "assistant", content: data.answer }]);
        setConversationId(data.conversationId);
      },
      onError: () => {
        setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I couldn't process your question. Please try again." }]);
      },
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function ask(q: string) {
    if (!q.trim()) return;
    setMessages(prev => [...prev, { role: "user", content: q }]);
    setQuestion("");
    askMutation.mutate({ data: { question: q, conversationId } });
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">AI-Powered EV FAQ</h1>
        <p className="text-muted-foreground">Ask anything about your electric vehicle — powered by our community knowledge base</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-card border rounded-2xl flex flex-col h-[500px]">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="h-full flex items-center justify-center text-center text-muted-foreground">
                  <div>
                    <p className="text-lg font-medium mb-2">Ask me anything about EVs</p>
                    <p className="text-sm">Range, charging, maintenance, features...</p>
                  </div>
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-3 text-sm",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-muted rounded-bl-sm"
                  )}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {askMutation.isPending && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3 text-sm text-muted-foreground">
                    Thinking...
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Ask a question..."
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && ask(question)}
                  className="flex-1"
                />
                <Button onClick={() => ask(question)} disabled={!question.trim() || askMutation.isPending}>
                  Ask
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-3">Suggested Questions</p>
            <div className="space-y-2">
              {SUGGESTED.map((q, i) => (
                <button
                  key={i}
                  onClick={() => ask(q)}
                  className="w-full text-left text-sm text-muted-foreground hover:text-foreground bg-card border rounded-lg px-3 py-2 hover:border-primary transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {faqs && faqs.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-3">Knowledge Base ({faqs.length} articles)</p>
              <div className="space-y-1">
                {faqs.slice(0, 5).map(faq => (
                  <button
                    key={faq.id}
                    onClick={() => ask(faq.question)}
                    className="w-full text-left text-xs text-muted-foreground hover:text-foreground px-2 py-1.5 rounded hover:bg-muted transition-colors"
                  >
                    {faq.question}
                  </button>
                ))}
              </div>
              {faqs.length > 5 && (
                <p className="text-xs text-muted-foreground mt-1 px-2">+{faqs.length - 5} more articles</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
