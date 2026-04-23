import React from 'react'
import { useState } from 'react';

const ExpneseCalander = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  
    const today = new Date().toISOString().split("T")[0];
  
    return (
      <div className="relative w-64 w-full  text-white text-sm mb-3 mt-2 ">
      {/* Input Button */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 bg-light-100/5 border border-slate-700 rounded-xl hover:border-indigo-500 transition"
      >
        {value || "Select date"}
      </button>

      {/* Dropdown Calendar */}
      {open && (
        <div className={`mt-2 overflow-hidden rounded-xl border border-slate-700  transition-all duration-300 ${
            open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}>
          <input
            type="date"
            max={today}
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              setOpen(false);
            }}
            className="w-full bg-light-100/5 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      )}
    </div>
    );
}

export default ExpneseCalander
