import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { BACKEND_URL } from "../config";

type Message = {
  role: "user" | "ai";
  content: string;
  sources?: Array<{ title: string; type: string; link: string; score: number }>;
};

export function AskBrain({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => setVisible(true), 10);
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${BACKEND_URL}/api/v1/brain/query`,
        { query: userMsg },
        { headers: { Authorization: token } }
      );
      setMessages(prev => [
        ...prev,
        { role: "ai", content: res.data.answer, sources: res.data.sources || [] }
      ]);
    } catch (err) {
      console.log(err);
      setMessages(prev => [
        ...prev,
        { role: "ai", content: "Something went wrong, try again" }
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") sendMessage();
  }

  const typeLabel: any = {
    youtube: "📹 Video",
    twitter: "🐦 Tweet",
    document: "📄 Article"
  };

  const panel = (
    <div className="flex flex-col h-full bg-white border-l border-purple-200">
      {/* header */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-lg">🧠</span>
          <h2 className="font-bold text-purple-700 text-sm">Ask your brain</h2>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-purple-100 transition-all text-lg leading-none"
        >
          ✕
        </button>
      </div>

      {/* messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {messages.length === 0 && !loading && (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 py-16">
            <span className="text-4xl">🔍</span>
            <p className="text-gray-400 text-sm text-center px-4">
              Ask anything about your saved content
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex flex-col gap-1 ${msg.role === "user" ? "items-end" : "items-start"}`}
          >
            <div
              className={`rounded-2xl px-3 py-2 text-sm max-w-[90%] leading-relaxed ${
                msg.role === "user"
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-tr-sm"
                  : "bg-gray-100 text-gray-800 rounded-tl-sm"
              }`}
            >
              {msg.content}
            </div>

            {msg.sources && msg.sources.length > 0 && (
              <div className="w-full flex flex-col gap-1 mt-1">
                <p className="text-xs text-gray-400 pl-1">Sources:</p>
                {msg.sources.map((src, j) => (
                  <a
                    key={j}
                    href={src.link || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs bg-purple-50 border border-purple-200 rounded-lg px-3 py-2 text-purple-700 hover:bg-purple-100 transition-all flex items-center gap-2"
                  >
                    <span className="shrink-0">{typeLabel[src.type] || "🔗 Link"}</span>
                    <span className="truncate">{src.title}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-start">
            <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-3 py-2 text-sm text-gray-500">
              Thinking<span className="animate-pulse">...</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* input */}
      <div className="p-3 border-t border-purple-100 flex gap-2 bg-white shrink-0">
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask something..."
          className="flex-1 text-sm border-2 border-purple-200 rounded-xl px-3 py-2 outline-none focus:border-purple-500 transition-all"
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl px-3 py-2 text-base hover:opacity-90 disabled:opacity-40 transition-all"
        >
          →
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* mobile: full screen overlay */}
      <div
        className={`md:hidden fixed inset-0 z-50 flex flex-col transition-transform duration-300 ${visible ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="fixed inset-0 bg-black bg-opacity-40 z-40" onClick={onClose} />
        <div className="relative z-50 flex flex-col h-full">
          {panel}
        </div>
      </div>

      {/* desktop: inline panel — h-full fills the h-screen parent in DashBoard */}
      <div
        className={`hidden md:flex flex-col shrink-0 h-full shadow-xl transition-all duration-300 overflow-hidden
          ${visible ? "w-80 opacity-100" : "w-0 opacity-0"}`}
      >
        {panel}
      </div>
    </>
  );
}
