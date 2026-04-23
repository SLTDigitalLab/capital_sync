import { useState, useRef, useEffect } from "react";
import InvoiceCard from "./Invoicecard";
import { useInvoiceStorage } from "../../hooks/useInvoiceStorage";
import { getAuthToken } from "../../utils/authUtils";

const WELCOME = {
  id:   "welcome",
  role: "bot",
  text: "Hi! Upload an invoice and I'll extract the data for you.",
};

const buildApiUrl = (provider) =>
  `http://127.0.0.1:8000/extract/invoice?provider=${provider}`;

const PROVIDERS = {
  gemini: { label: "Gemini", dotColor: "bg-blue-400"    },
  openai: { label: "GPT-4o", dotColor: "bg-emerald-400" },
};

const uid = () => crypto.randomUUID();

export default function ChatPanel({ activeTab, onClose, userId }) {
  // userId — parent component (InvoiceChatWidget) එකෙන් pass වෙනවා
  // token needed නෑ — user already logged in

  const [messages,  setMessages]  = useState([WELCOME]);
  const [loading,   setLoading]   = useState(false);
  const [inputText, setInputText] = useState("");
  const [provider,  setProvider]  = useState("gemini");

  const bottomRef    = useRef(null);
  const fileInputRef = useRef(null);
  const storage      = useInvoiceStorage();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const addMessage = (msg) =>
    setMessages((prev) => [...prev, { id: uid(), ...msg }]);

  const handleSendText = () => {
    if (!inputText.trim()) return;
    addMessage({ role: "user", text: inputText.trim() });
    setInputText("");
  };

  const handleFileSelect = async (f) => {
    if (!f) return;
    setLoading(true);
    addMessage({ role: "user", text: `📎 ${f.name}` });
    addMessage({ role: "bot",  text: `Using ${PROVIDERS[provider].label} to extract...` });

    try {
      // Token still needed for extract endpoint (auth protected)
      const token = await getAuthToken();

      const form = new FormData();
      form.append("file", f);

      const res = await fetch(buildApiUrl(provider), {
        method: "POST",
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
        body: form,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || `Error ${res.status}`);
      }

      const data = await res.json();
      addMessage({ role: "bot", type: "invoice_card", data });

    } catch (e) {
      addMessage({ role: "bot", text: `❌ ${e.message}` });
    } finally {
      setLoading(false);
      fileInputRef.current.value = "";
    }
  };

  const handleSave = (data) => {
    addMessage({
      role: "bot",
      text: `✓ Saved to DB — ${data.invoice_type === "income" ? "▲ Income" : "▼ Expense"} · ${data.currency || "LKR"} ${Number(data.amount).toLocaleString()}`,
    });
  };

  const handleClear = () => {
    storage.clear();
    setMessages([WELCOME]);
  };

  const currentProvider = PROVIDERS[provider];

  return (
    <>
      <div className="fixed bottom-24 right-6 z-50 w-80 h-[520px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${provider === "openai" ? "bg-emerald-500" : "bg-blue-500"}`}>
              <span className="text-white text-[9px] font-bold">AI</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 leading-tight">Chat</p>
              <p className="text-[10px] text-slate-400 leading-tight">
                {storage.getAll().length} invoice{storage.getAll().length !== 1 ? "s" : ""} saved
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg overflow-hidden border border-slate-200 text-[10px] font-semibold">
              <button onClick={() => setProvider("gemini")}
                className={`px-2.5 py-1.5 transition-all ${provider === "gemini" ? "bg-blue-500 text-white" : "bg-white text-slate-400 hover:bg-slate-50"}`}>
                Gemini
              </button>
              <button onClick={() => setProvider("openai")}
                className={`px-2.5 py-1.5 transition-all ${provider === "openai" ? "bg-emerald-500 text-white" : "bg-white text-slate-400 hover:bg-slate-50"}`}>
                GPT-4o
              </button>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 bg-slate-50">
          {activeTab !== "invoice" && (
            <>
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-2 ${msg.role === "bot" ? "justify-start" : "justify-end"}`}>
                  {msg.role === "bot" && (
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${provider === "openai" ? "bg-emerald-500" : "bg-blue-500"}`}>
                      <span className="text-white text-[8px] font-bold">AI</span>
                    </div>
                  )}
                  {msg.type === "invoice_card" ? (
                    <div className="flex-1 min-w-0">
                      {/* userId pass to InvoiceCard */}
                      <InvoiceCard data={msg.data} onSave={handleSave} userId={userId} />
                    </div>
                  ) : (
                    <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs
                      ${msg.role === "bot"
                        ? "bg-white border border-slate-200 text-slate-700 rounded-tl-sm"
                        : "bg-sky-500 text-white rounded-tr-sm"}`}>
                      <p>{msg.text}</p>
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${provider === "openai" ? "bg-emerald-500" : "bg-blue-500"}`}>
                    <span className="text-white text-[8px] font-bold">AI</span>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-3 py-2.5">
                    <div className="flex gap-1 items-center">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </>
          )}

          {activeTab === "invoice" && (
            <div className="flex flex-col gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 px-1">
                Saved Invoices ({storage.getAll().length})
              </p>
              {storage.getAll().length === 0 ? (
                <div className="flex flex-col items-center gap-2 mt-8 text-slate-400">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                  <p className="text-xs">No invoices saved yet</p>
                </div>
              ) : (
                storage.getAll().map((inv) => (
                  <div key={inv.id} className="bg-white rounded-xl p-3 border border-slate-200 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${inv.invoice_type === "income" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {inv.invoice_type === "income" ? "▲ Income" : "▼ Expense"}
                      </span>
                      <span className="text-xs font-semibold text-slate-700">
                        {inv.currency || "LKR"} {Number(inv.amount).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-slate-700 truncate">{inv.title}</p>
                    <p className="text-[10px] text-slate-400">{inv.date} · {inv.category}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col gap-2 px-3 py-3 border-t border-slate-100 flex-shrink-0 bg-white">
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${currentProvider.dotColor}`} />
            <span className="text-[10px] text-slate-400">
              Using <span className="font-semibold text-slate-600">{currentProvider.label}</span> for extraction
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,.docx"
              className="hidden" onChange={(e) => handleFileSelect(e.target.files[0])} />
            <button onClick={() => fileInputRef.current?.click()}
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border transition-all active:scale-95
                ${provider === "openai" ? "border-emerald-400 text-emerald-500 hover:bg-emerald-50" : "border-blue-400 text-blue-500 hover:bg-blue-50"}`}
              title="Upload invoice">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
              </svg>
            </button>
            <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendText()} placeholder="Type a message..."
              className="flex-1 text-xs px-3 py-2 rounded-full border border-slate-200 bg-slate-50 outline-none focus:border-sky-400 focus:bg-white transition-all" />
            <button onClick={handleSendText} disabled={!inputText.trim()}
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all active:scale-95
                ${inputText.trim() ? "bg-sky-500 text-white hover:bg-sky-600" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-slate-400">{storage.getAll().length} saved</p>
            <button onClick={handleClear}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-[10px] text-slate-500 transition-all">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              </svg>
              Clear
            </button>
          </div>
        </div>
      </div>
    </>
  );
}