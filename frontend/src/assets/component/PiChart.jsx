import { useState, useEffect, useRef } from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
} from "recharts";

const COLORS = ["#8080FF", "#0353a4"];

const PiChart = ({ totalIncome = 245000, totalExpense = 85000 }) => {
  const [titleText, setTitleText] = useState("");
  const [headerVisible, setHeaderVisible] = useState(false);
  const [barsAnimated, setBarsAnimated] = useState(false);
  const [displayIncome, setDisplayIncome] = useState(0);
  const [displayExpense, setDisplayExpense] = useState(0);
  const [displayTotal, setDisplayTotal] = useState(0);
  const [pieVisible, setPieVisible] = useState(false);
  const hasAnimated = useRef(false);

  const title = "Distribution";
  const data = [
    { name: "Income", value: totalIncome },
    { name: "Expenses", value: totalExpense },
  ];
  const total = totalIncome + totalExpense;
  const incomePercent = total > 0 ? Math.round((totalIncome / total) * 100) : 0;
  const expensePercent = total > 0 ? Math.round((totalExpense / total) * 100) : 0;

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    // Typewriter
    let i = 0;
    const typeInterval = setInterval(() => {
      setTitleText(title.slice(0, i + 1));
      i++;
      if (i === title.length) clearInterval(typeInterval);
    }, 70);

    const baseDelay = title.length * 70 + 100;

    // Fade in header
    setTimeout(() => setHeaderVisible(true), baseDelay);

    // Pie fade in
    setTimeout(() => setPieVisible(true), baseDelay + 200);

    // Bars animate
    setTimeout(() => setBarsAnimated(true), baseDelay + 400);

    // Counter — income
    const runCounter = (target, setter, delay) => {
      const steps = 60;
      const duration = 1200;
      let step = 0;
      let current = 0;
      setTimeout(() => {
        const interval = setInterval(() => {
          step++;
          current += target / steps;
          setter(step >= steps ? target : Math.floor(current));
          if (step >= steps) clearInterval(interval);
        }, duration / steps);
      }, delay);
    };

    runCounter(totalIncome, setDisplayIncome, baseDelay + 450);
    runCounter(totalExpense, setDisplayExpense, baseDelay + 550);
    runCounter(total, setDisplayTotal, baseDelay + 650);
  }, []);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ fontFamily: "'DM Mono', monospace", background: "rgba(0,0,0,0.85)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(10px)" }}
          className="px-3 py-2 rounded-xl shadow-2xl text-xs"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: payload[0].fill }} />
            <span className="text-white/60">{payload[0].name}</span>
            <span className="font-semibold ml-2" style={{ color: payload[0].fill }}>
              ${Number(payload[0].value).toLocaleString()}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  const HorizontalBar = ({ percent, color, label, amount, animated }) => (
    <div className="flex flex-col gap-[3px] w-full">
      <div className="flex justify-between items-center">
        <span className="text-white/40 text-[9px] tracking-wide uppercase">{label}</span>
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-[10px]" style={{ color, fontFamily: "'DM Mono', monospace" }}>
            ${Number(amount).toLocaleString()}
          </span>
          <span className="text-white/50 text-[9px] font-bold">{percent}%</span>
        </div>
      </div>
      <div className="w-full h-[4px] bg-white/8 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
        <div
          className="h-full rounded-full"
          style={{
            width: animated ? `${percent}%` : "0%",
            backgroundColor: color,
            boxShadow: `0 0 8px ${color}80`,
            transition: "width 1.2s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />
      </div>
    </div>
  );

  return (
    <div className="w-full sm:flex-1 h-[260px] sm:h-[280px] lg:h-[320px] bg-black/50 rounded-[20px] relative overflow-hidden flex items-center px-3 py-3 gap-1"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        @keyframes blink { 50% { opacity: 0; } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pieFadeIn {
          from { opacity: 0; transform: scale(0.85); }
          to   { opacity: 1; transform: scale(1); }
        }
        .cursor-blink::after { content: '|'; animation: blink 0.65s step-end infinite; color: #8080FF; }
        .pie-enter { animation: pieFadeIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .legend-fade { animation: fadeUp 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
      `}</style>

      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[1px]"
        style={{ background: "linear-gradient(90deg, transparent, #8080FF60, #0353a460, transparent)" }}
      />

      {/* Subtle grid */}
      <div className="absolute inset-0 opacity-[0.025]"
        style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "20px 20px" }}
      />

      {/* Pie Chart */}
      <div className="h-full relative" style={{ width: "62%" }}>
        <div
          className="pie-enter w-full h-full"
          style={{ opacity: 0, animationPlayState: pieVisible ? "running" : "paused", animationFillMode: "forwards" }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%" cy="50%"
                outerRadius="58%"
                innerRadius="30%"
                dataKey="value"
                strokeWidth={0}
                paddingAngle={3}
              >
                {data.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Legend + Bars */}
      <div
        className="legend-fade flex flex-col justify-center gap-4 pr-1"
        style={{ width: "38%", opacity: 0, animationPlayState: headerVisible ? "running" : "paused", animationFillMode: "forwards" }}
      >
        {/* Label */}
        <div>
          <p className="text-white/30 text-[8px] tracking-[0.2em] uppercase mb-0.5">Overview</p>
          <p className="text-white font-semibold text-sm min-h-[20px]">
            {titleText}
            {titleText.length < title.length && <span className="cursor-blink" />}
          </p>
        </div>

        {/* Income bar */}
        <div className="flex flex-col gap-1">
          <p className="text-white/80 font-semibold text-[11px]">Incomes</p>
          <HorizontalBar
            percent={incomePercent}
            color="#8080FF"
            label="Inc"
            amount={displayIncome}
            animated={barsAnimated}
          />
        </div>

        {/* Expense bar */}
        <div className="flex flex-col gap-1">
          <p className="text-white/80 font-semibold text-[11px]">Expenses</p>
          <HorizontalBar
            percent={expensePercent}
            color="#0353a4"
            label="Exp"
            amount={displayExpense}
            animated={barsAnimated}
          />
        </div>

        {/* Total */}
        <div className="border-t pt-2 w-full" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <p className="text-white/30 text-[9px] tracking-widest uppercase">Total</p>
          <p className="text-white font-bold text-sm mt-0.5" style={{ fontFamily: "'DM Mono', monospace" }}>
            ${displayTotal.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PiChart;