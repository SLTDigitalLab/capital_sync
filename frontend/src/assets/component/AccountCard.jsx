import { useState, useEffect, useRef } from "react";

const AccountCard = ({
  mainAccountBalance = 485000,
  totalSalary = 120000,
  totalInvestment = 45000,
  totalBusinessIncome = 80000,
  totalFoodandDrink = 18000,
  totalHousing = 55000,
  totalTransportation = 12000,
}) => {
  const [activeTab, setActiveTab] = useState("income");
  const [displayBalance, setDisplayBalance] = useState(0);
  const [titleText, setTitleText] = useState("");
  const [visibleItems, setVisibleItems] = useState([]);
  const [headerVisible, setHeaderVisible] = useState(false);
  const hasAnimated = useRef(false);

  const title = "Main Account Balance";

  const expenseData = [
    { id: 1, category: "Food & Drink", amount: totalFoodandDrink, icon: "🍜" },
    { id: 2, category: "Housing", amount: totalHousing, icon: "🏠" },
    { id: 3, category: "Transport", amount: totalTransportation, icon: "🚗" },
  ];
  const incomeData = [
    { id: 1, category: "Salary", amount: totalSalary, icon: "💼" },
    { id: 2, category: "Investment", amount: totalInvestment, icon: "📈" },
    { id: 3, category: "Business", amount: totalBusinessIncome, icon: "🏢" },
  ];

  const activeData = activeTab === "income" ? incomeData : expenseData;
  const totalIncome = incomeData.reduce((s, i) => s + i.amount, 0);
  const totalExpense = expenseData.reduce((s, i) => s + i.amount, 0);

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    let i = 0;
    const typeInterval = setInterval(() => {
      setTitleText(title.slice(0, i + 1));
      i++;
      if (i === title.length) clearInterval(typeInterval);
    }, 55);

    setTimeout(() => setHeaderVisible(true), title.length * 55 + 100);

    const delay = title.length * 55 + 200;
    const duration = 1400;
    const steps = 70;
    const increment = mainAccountBalance / steps;
    let current = 0;
    let step = 0;
    setTimeout(() => {
      const counter = setInterval(() => {
        step++;
        current += increment;
        setDisplayBalance(step >= steps ? mainAccountBalance : Math.floor(current));
        if (step >= steps) clearInterval(counter);
      }, duration / steps);
    }, delay);

    incomeData.forEach((_, index) => {
      setTimeout(() => setVisibleItems(prev => [...prev, index]), delay + 500 + index * 130);
    });
  }, []);

  const handleTabSwitch = (tab) => {
    if (tab === activeTab) return;
    setVisibleItems([]);
    setActiveTab(tab);
    [0, 1, 2].forEach(index => {
      setTimeout(() => setVisibleItems(prev => [...prev, index]), index * 110);
    });
  };

  const isIncome = activeTab === "income";
  const accentColor = isIncome ? "#8080FF" : "#0353a4";
  const accentGlow = isIncome ? "rgba(128,128,255,0.3)" : "rgba(3,83,164,0.3)";

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}
      className="relative bg-black/50 rounded-[20px] shadow-md hover:bg-black/30 hover:shadow-2xl transition duration-300 overflow-hidden"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes blink { 50% { opacity: 0; } }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes pulseRing {
          0% { transform: scale(0.95); opacity: 0.6; }
          70% { transform: scale(1.05); opacity: 0; }
          100% { transform: scale(0.95); opacity: 0; }
        }

        .fade-up-item {
          animation: fadeUp 0.38s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .cursor-blink::after {
          content: '|';
          animation: blink 0.65s step-end infinite;
          color: #8080FF;
        }
        .balance-shimmer {
          background: linear-gradient(90deg, #fff 0%, #fff 40%, #c8c8ff 50%, #fff 60%, #fff 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }
        .tab-pill {
          position: relative;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .tab-pill.active::before {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: 999px;
          background: var(--accent-glow);
          filter: blur(8px);
          z-index: -1;
        }
        .row-item {
          transition: transform 0.2s ease;
        }
        .row-item:hover {
          transform: translateX(3px);
        }
      `}</style>

      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`, transition: "background 0.4s ease" }}
      />

      {/* Subtle grid bg */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "24px 24px" }}
      />

      <div className="relative p-8">

        {/* Title */}
        <div className="text-center mb-1">
          <p className="text-white/50 text-[10px] tracking-[0.2em] uppercase font-medium mb-2">
            {titleText.length >= title.length ? "Overview" : ""}
          </p>
          <p className="text-white/80 font-light text-sm tracking-wide min-h-[22px]">
            {titleText}
            {titleText.length < title.length && <span className="cursor-blink" />}
          </p>
        </div>

        {/* Balance */}
        <div className="text-center mt-2 mb-6"
          style={{ opacity: headerVisible ? 1 : 0, transition: "opacity 0.6s ease, transform 0.6s ease", transform: headerVisible ? "translateY(0)" : "translateY(8px)" }}
        >
          <p className="balance-shimmer text-3xl font-bold tracking-tight"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            Rs {displayBalance.toLocaleString()}
          </p>
          <div className="flex justify-center gap-4 mt-2">
            <span className="text-[10px] text-white/40">
              ↑ <span style={{ color: "#8080FF" }}>Rs {totalIncome.toLocaleString()}</span>
            </span>
            <span className="text-white/20 text-[10px]">|</span>
            <span className="text-[10px] text-white/40">
              ↓ <span style={{ color: "#0353a4" }}>Rs {totalExpense.toLocaleString()}</span>
            </span>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex gap-2 mb-5 p-1 bg-white/5 rounded-2xl"
          style={{ opacity: headerVisible ? 1 : 0, transition: "opacity 0.5s ease 0.15s" }}
        >
          {["income", "expense"].map(tab => (
            <button key={tab}
              onClick={() => handleTabSwitch(tab)}
              className={`tab-pill cursor-pointer flex-1 h-[34px] rounded-xl text-xs font-semibold tracking-wide transition-all duration-300 ${
                activeTab === tab ? "text-black shadow-md" : "text-white/40 hover:text-white/70"
              }`}
              style={{
                "--accent-glow": accentGlow,
                background: activeTab === tab ? (tab === "income" ? "#8080FF" : "#0353a4") : "transparent",
              }}
            >
              {tab === "income" ? "Income" : "Expenses"}
            </button>
          ))}
        </div>

        {/* Section label */}
        <div className="flex items-center gap-2 mb-3"
          style={{ opacity: headerVisible ? 1 : 0, transition: "opacity 0.5s ease 0.2s" }}
        >
          <div className="h-[1px] flex-1 bg-white/10" />
          <p className="text-white/30 text-[9px] tracking-[0.15em] uppercase font-medium">
            Top Categories
          </p>
          <div className="h-[1px] flex-1 bg-white/10" />
        </div>

        {/* List */}
        <div className="space-y-2">
          {activeData.map((item, index) => {
            const pct = Math.round((item.amount / (isIncome ? totalIncome : totalExpense)) * 100);
            return (
              <div key={item.id}
                className="fade-up-item row-item"
                style={{
                  opacity: 0,
                  animationPlayState: visibleItems.includes(index) ? "running" : "paused",
                  animationFillMode: "forwards",
                }}
              >
                <div className="relative flex items-center justify-between px-3 py-2 rounded-[12px] overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                >
                  {/* Progress fill */}
                  <div className="absolute inset-0 rounded-[12px] opacity-10"
                    style={{ width: `${pct}%`, background: accentColor, transition: "background 0.4s ease" }}
                  />
                  <div className="relative flex items-center gap-2">
                    <span className="text-base">{item.icon}</span>
                    <span className="text-white/80 text-xs font-medium">{item.category}</span>
                  </div>
                  <div className="relative flex items-center gap-2">
                    <span className="text-white/30 text-[9px]">{pct}%</span>
                    <span className="text-xs font-semibold" style={{ color: accentColor, fontFamily: "'DM Mono', monospace" }}>
                      Rs {item.amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default AccountCard;