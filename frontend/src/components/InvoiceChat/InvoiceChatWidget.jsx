import { useState, useEffect } from "react";
import ChatPanel from "./ChatPanel";
import { getCurrentUserId } from "../../utils/authUtils";

export default function InvoiceChatWidget() {
  const [open,   setOpen]   = useState(false);
  const [userId, setUserId] = useState(null);

  // Get user ID when component mounts — user already logged in at this point
  useEffect(() => {
    const id = getCurrentUserId();
    setUserId(id);
  }, []);

  return (
    <>
      {/* Chat panel — userId pass down the chain */}
      {open && (
        <ChatPanel
          onClose={() => setOpen(false)}
          userId={userId}
        />
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-sky-500 hover:bg-sky-600 text-white shadow-lg flex items-center justify-center transition-all active:scale-95"
        title="Invoice AI"
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
        )}
      </button>
    </>
  );
}