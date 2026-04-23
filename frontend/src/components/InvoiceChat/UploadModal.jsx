import { useRef, useState } from "react";

export default function UploadModal({ onClose, onFileSelect }) {
  const inputRef    = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = (f) => { if (f) { onFileSelect(f); onClose(); } };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800 text-sm">Upload Invoice</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl">×</button>
        </div>
        <div className="p-4">
          <div
            onClick={() => inputRef.current.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
            className={`flex flex-col items-center justify-center gap-2 h-36 rounded-xl border-2 border-dashed cursor-pointer transition-colors
              ${dragging ? "border-sky-400 bg-sky-50" : "border-slate-300 bg-slate-50 hover:border-sky-400 hover:bg-sky-50"}`}
          >
            <input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,.docx"
              className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
            <svg className="text-sky-400" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <p className="text-xs font-medium text-slate-600">Drag & drop or click</p>
            <p className="text-[10px] text-slate-400">PDF · JPG · PNG · DOCX</p>
          </div>
        </div>
      </div>
    </div>
  );
}