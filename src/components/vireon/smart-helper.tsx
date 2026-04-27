"use client";

import { useVireonStore, type ChatMessage } from "@/store/vireon-store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import ReactMarkdown from "react-markdown";
import {
  Bot,
  Send,
  User,
  Sparkles,
  Lightbulb,
  Loader2,
  RotateCcw,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

const QUICK_QUESTIONS = [
  "Explain recursion simply",
  "What is a binary tree?",
  "How does a stack work?",
  "Explain Big O notation",
  "What is a linked list?",
  "How does DNS work?",
];

export function SmartHelperSection() {
  const { chatHistory, addChatMessage, clearChatHistory } = useVireonStore();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isLoading]);

  const handleSend = async (message?: string) => {
    const userMessage = (message || input).trim();
    if (!userMessage || isLoading) return;
    setInput("");
    addChatMessage("user", userMessage);
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, history: chatHistory }),
      });
      const data = await res.json();
      if (data.response) {
        addChatMessage("assistant", data.response);
      } else {
        toast.error("Failed to get response from AI");
      }
    } catch {
      toast.error("Failed to connect to AI assistant");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    clearChatHistory();
    toast.success("Chat history cleared");
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header — compact on mobile */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="px-4 py-3 sm:p-6 sm:pb-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Bot size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-bold">Vireon Bro</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Your CSE study buddy
              </p>
            </div>
          </div>
          {chatHistory.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="text-muted-foreground hover:text-destructive h-8"
            >
              <RotateCcw size={14} className="mr-1" />
              <span className="hidden sm:inline">Clear</span>
            </Button>
          )}
        </div>
      </motion.div>

      <Separator />

      {/* Chat Area — fills remaining space */}
      <div className="flex-1 overflow-hidden relative min-h-0">
        {chatHistory.length === 0 && !isLoading ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center h-full p-4 sm:p-6 text-center"
          >
            <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 sm:mb-6">
              <Sparkles size={28} className="text-primary sm:size-9" />
            </div>
            <h3 className="text-base sm:text-xl font-semibold mb-2">
              Hey! Vireon Bro here 👋
            </h3>
            <p className="text-muted-foreground mb-6 sm:mb-8 max-w-sm text-xs sm:text-sm">
              I can explain concepts, help with algorithms, data structures, and
              more. Try one of these:
            </p>
            <div className="flex flex-wrap gap-2 justify-center max-w-sm sm:max-w-lg">
              {QUICK_QUESTIONS.map((q, i) => (
                <motion.button
                  key={q}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  onClick={() => handleSend(q)}
                  className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium hover:bg-primary/20 transition-colors"
                >
                  <Lightbulb size={11} className="inline mr-1" />
                  {q}
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          /* Messages */
          <div
            className="h-full overflow-y-auto p-3 sm:p-4 scroll-smooth"
            ref={scrollRef}
          >
            <div className="max-w-3xl mx-auto space-y-3 sm:space-y-4">
              <AnimatePresence mode="popLayout">
                {chatHistory.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={cn(
                      "flex gap-2 sm:gap-3",
                      msg.role === "user" ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    {/* Avatar */}
                    <div
                      className={cn(
                        "w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0",
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}
                    >
                      {msg.role === "user" ? (
                        <User size={14} />
                      ) : (
                        <Bot size={14} className="text-primary" />
                      )}
                    </div>

                    {/* Message Content */}
                    <div
                      className={cn(
                        "max-w-[85%] sm:max-w-[80%] rounded-2xl px-3 py-2.5 sm:px-4 sm:py-3",
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-tr-sm"
                          : "bg-card border border-border rounded-tl-sm shadow-sm"
                      )}
                    >
                      {msg.role === "assistant" ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-xs sm:text-sm whitespace-pre-wrap">{msg.content}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className="flex gap-2 sm:gap-3"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Bot size={14} className="text-primary" />
                  </div>
                  <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-3 py-2.5 sm:px-4 sm:py-3">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-primary/50 animate-bounce [animation-delay:0ms]" />
                      <span className="w-2 h-2 rounded-full bg-primary/50 animate-bounce [animation-delay:150ms]" />
                      <span className="w-2 h-2 rounded-full bg-primary/50 animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                </motion.div>
              )}
              {/* Invisible scroll anchor */}
              <div ref={messagesEndRef} className="h-px" />
            </div>
          </div>
        )}
      </div>

      {/* Quick suggestions when chat has messages */}
      {chatHistory.length > 0 && !isLoading && (
        <div className="px-3 sm:px-4 py-1.5 sm:py-2 border-t border-border">
          <div className="flex gap-2 overflow-x-auto max-w-3xl mx-auto pb-1 scrollbar-none">
            {QUICK_QUESTIONS.slice(0, 4).map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                className="px-2.5 py-1 sm:px-3 sm:py-1 rounded-full bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors whitespace-nowrap shrink-0"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area — sticky at bottom */}
      <div className="p-3 sm:p-4 border-t border-border [padding-bottom:max(env(safe-area-inset-bottom),12px)]">
        <div className="max-w-3xl mx-auto flex gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Vireon Bro anything..."
              rows={1}
              disabled={isLoading}
              className={cn(
                "w-full resize-none rounded-xl border border-border bg-card px-3 py-2.5 sm:px-4 sm:py-3 text-base",
                "placeholder:text-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
                "disabled:opacity-50",
                "max-h-24"
              )}
              style={{
                height: "auto",
                minHeight: "44px",
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height =
                  Math.min(target.scrollHeight, 96) + "px";
              }}
            />
          </div>
          <Button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="rounded-xl h-11 w-11 shrink-0"
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
