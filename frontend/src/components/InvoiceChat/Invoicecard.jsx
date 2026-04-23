import { useState } from "react";

const SAVE_URL = "http://127.0.0.1:8000/extract/save";

export default function InvoiceCard({ data, onSave, userId }) {
  const [saved,  setSaved]  = useState(false);
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState(null);
  const [form,   setForm]   = useState({
    invoice_type:   data.invoice_type   || "expense",
    title:          data.title          || "",
    amount:         data.amount         || "",
    currency:       data.currency       || "LKR",
    category:       data.category       || "",
    date:           data.date           || "",
    payment_method: data.payment_method || "",
    invoice_number: data.invoice_number || "",
    tax_amount:     data.tax_amount     || "",
    description:    data.description    || "",
  });

  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));
  const isIncome = form.invoice_type === "income";

  // Send edited form data to backend
  // user_id comes from parent — no token needed
  const handleConfirm = async () => {
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(SAVE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id:        userId,               // from parent prop
          invoice_type:   form.invoice_type,
          title:          form.title          || null,
          amount:         parseFloat(form.amount),
          currency:       form.currency,
          category:       form.category,
          date:           form.date           || null,
          payment_method: form.payment_method || null,
          invoice_number: form.invoice_number || null,
          tax_amount:     form.tax_amount ? parseFloat(form.tax_amount) : null,
          description:    form.description    || null,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || `Error ${res.status}`);
      }

      await res.json();
      onSave(form);
      setSaved(true);

    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(form, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `invoice_${form.invoice_number || Date.now()}.json`;
    a.click();
  };

  if (saved) {
    return (
      <div className="w-full rounded-2xl border border-green-200 bg-green-50 px-4 py-4 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <p className="text-xs font-semibold text-green-700">Saved to Database</p>
        </div>
        <p className="text-[11px] text-green-600 pl-8">
          {isIncome ? "▲ Income" : "▼ Expense"} · {form.currency} {Number(form.amount).toLocaleString("en-LK", { minimumFractionDigits: 2 })}
        </p>
        <p className="text-[10px] text-green-500 pl-8">{form.title} · {form.date}</p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white overflow-hidden">

      <div className={`px-3 pt-3 pb-2 border-b border-slate-100 ${isIncome ? "bg-green-50" : "bg-red-50"}`}>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-2">Review &amp; Edit</p>
        <div className="flex rounded-xl overflow-hidden border border-slate-200 text-[11px] font-semibold w-full">
          <button onClick={() => set("invoice_type", "income")}
            className={`flex-1 py-1.5 transition-all ${isIncome ? "bg-green-500 text-white" : "bg-white text-slate-400 hover:bg-slate-50"}`}>
            ▲ Income
          </button>
          <button onClick={() => set("invoice_type", "expense")}
            className={`flex-1 py-1.5 transition-all ${!isIncome ? "bg-red-500 text-white" : "bg-white text-slate-400 hover:bg-slate-50"}`}>
            ▼ Expense
          </button>
        </div>
      </div>

      <div className="px-3 py-2.5 flex flex-col gap-2.5">
        <div className="flex flex-col gap-1">
          <label className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">Vendor</label>
          <input type="text" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Vendor name"
            className="w-full text-xs text-slate-800 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 outline-none focus:border-sky-400 focus:bg-white transition-all" />
        </div>
        <div className="flex gap-2">
          <div className="flex flex-col gap-1 w-16 flex-shrink-0">
            <label className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">Currency</label>
            <input type="text" value={form.currency} onChange={(e) => set("currency", e.target.value)}
              className="w-full text-xs text-slate-800 px-2 py-2 rounded-lg border border-slate-200 bg-slate-50 outline-none focus:border-sky-400 focus:bg-white transition-all text-center font-semibold" />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">Amount</label>
            <input type="number" value={form.amount} onChange={(e) => set("amount", e.target.value)} placeholder="0.00"
              className="w-full text-xs text-slate-800 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 outline-none focus:border-sky-400 focus:bg-white transition-all" />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">Category</label>
            <input type="text" value={form.category} onChange={(e) => set("category", e.target.value)} placeholder="e.g. Utilities"
              className="w-full text-xs text-slate-800 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 outline-none focus:border-sky-400 focus:bg-white transition-all" />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">Date</label>
            <input type="date" value={form.date} onChange={(e) => set("date", e.target.value)}
              className="w-full text-xs text-slate-800 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 outline-none focus:border-sky-400 focus:bg-white transition-all" />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">Payment</label>
            <input type="text" value={form.payment_method} onChange={(e) => set("payment_method", e.target.value)} placeholder="e.g. Cash"
              className="w-full text-xs text-slate-800 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 outline-none focus:border-sky-400 focus:bg-white transition-all" />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">Invoice No.</label>
            <input type="text" value={form.invoice_number} onChange={(e) => set("invoice_number", e.target.value)} placeholder="INV-001"
              className="w-full text-xs text-slate-800 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 outline-none focus:border-sky-400 focus:bg-white transition-all" />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">Tax Amount</label>
          <input type="number" value={form.tax_amount} onChange={(e) => set("tax_amount", e.target.value)} placeholder="0.00"
            className="w-full text-xs text-slate-800 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 outline-none focus:border-sky-400 focus:bg-white transition-all" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">Description</label>
          <textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Description..." rows={2}
            className="w-full text-xs text-slate-800 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 outline-none focus:border-sky-400 focus:bg-white transition-all resize-none" />
        </div>
        {error && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-red-500 flex-shrink-0">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p className="text-[10px] text-red-600">{error}</p>
          </div>
        )}
      </div>
      
      <div className="flex gap-2 px-3 pb-3">
        {/* <button onClick={handleDownload}
        className="px-3 py-2 rounded-xl border border-slate-200 text-[11px] text-slate-600 hover:bg-slate-50 transition-all flex-shrink-0">
        Download
        </button> */}

        <button onClick={handleConfirm} disabled={saving}
          className={`w-full py-2 rounded-xl text-white text-[11px] font-semibold transition-all active:scale-95
          ${saving ? "bg-slate-300 cursor-not-allowed" : isIncome ? "bg-green-500 hover:bg-green-600" : "bg-sky-500 hover:bg-sky-600"}`}>
          {saving ? "Saving..." : "✓ Confirm & Save"}
        </button>
      </div>
    </div>
  );
}