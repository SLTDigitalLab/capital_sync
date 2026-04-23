import React from 'react'
import { useState } from 'react'



const ExpenseSourceSelect = ({ value, onChange }) => {

    const [isOpen, setIsOpen] = useState(false);

    const options = [
    { id: 1, label: "Cash"},
    // { id: 2, label: "Bank" },
  ];

    const handleSelect = (option) => {
        onChange(option.label);
        setIsOpen(false);

    };
  return (
    
        <div className="w-full  text-white mb-3 mt-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-5 py-4 bg-light-100/5 border border-slate-700 rounded-xl hover:border-indigo-500 transition"
        >
          <span className='text-sm'>{value || "Choose Source"}</span>
          <span
            className={`transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
          >
            ▼
          </span>
        </button>

        <div className={`mt-2 overflow-hidden rounded-xl border border-slate-700 bg-slate-950 transition-all duration-300 ${
            isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}>
            {options.map((option) => (
                <button 
                    key={option.id}
                    onClick={() => handleSelect(option)}
                    className={`w-full px-5 py-4 text-left flex justify-between items-center hover:bg-indigo-500/10 transition ${value === option.label ? "bg-indigo-500/20" : ""
              }`}>
                    <div>
                        <p className='font-medium'>{option.label}</p>
                        <p className='text-sm text-slate-400'>{option.desc}</p>
                    </div>

                    {value === option.label && (
                        <span className='text-indigo-400'>✔</span>
                    )}
                </button>
            ))}
        </div>
        </div>
    
  );
};

export default ExpenseSourceSelect
