"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "./style.module.scss";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { chatWithAI } from "./actions";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Page() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const aiResponse = await chatWithAI(input);
      // 型アサーションを使用して、aiResponseが必ず文字列であることを保証
      const assistantMessage: Message = {
        role: "assistant",
        content: aiResponse as string,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: "エラーが発生しました。もう一度お試しください。",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (

    <section className='flex size-full flex-col text-white'>
    <div className={styles.mainContent}>
      <div className={styles.mainContent__inner}>
        <section className="flex size-full flex-col gap-10 text-white">
          <h1 className="text-3xl font-bold">AI Jellyくん</h1>
          <div className="flex flex-col h-[500px] overflow-y-auto mb-4 p-4 rounded-lg">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-2 ${
                  msg.role === "user" ? "text-right" : "text-left"
                }`}
              >
                <span
                  className={`inline-block p-2 rounded-lg ${
                    msg.role === "user" ? "bg-blue-500" : "bg-gray-600"
                  }`}
                >
                  {msg.content}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
              <form
                onSubmit={handleSubmit}
                className="flex gap-2 justify-betwee"
              >
                    <Input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="メッセージを入力..."
                      className="flex-grow"
                    />
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "送信中..." : "送信"}
                    </Button>
              </form>
        </section>
      </div>
    </div>
        </section>
  );
}
