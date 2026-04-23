import { useState, useEffect, useRef } from "react"

const LatestFiveExpenses = ({ latestExpenses = [
  { id: 1, category: "Food & Drink", amount: 18000 },
  { id: 2, category: "Housing", amount: 55000 },
  { id: 3, category: "Transport", amount: 12000 },
  { id: 4, category: "Utilities", amount: 8500 },
  { id: 5, category: "Entertainment", amount: 6200 },
]}) => {
  const totalLatestFive = latestExpenses.reduce((sum, item) => sum + Number(item.amount), 0)

  const [displayCount, setDisplayCount] = useState(0)
  const [titleText, setTitleText] = useState("")
  const [visibleItems, setVisibleItems] = useState([])
  const [headerVisible, setHeaderVisible] = useState(false)
  const hasAnimated = useRef(false)

  const title = "Expenses"

  useEffect(() => {
    if (hasAnimated.current) return
    hasAnimated.current = true

    let i = 0
    const typeInterval = setInterval(() => {
      setTitleText(title.slice(0, i + 1))
      i++
      if (i === title.length) clearInterval(typeInterval)
    }, 70)

    const baseDelay = title.length * 70 + 100
    setTimeout(() => setHeaderVisible(true), baseDelay)

    const steps = 60, duration = 1200
    let step = 0, current = 0
    setTimeout(() => {
      const counter = setInterval(() => {
        step++
        current += totalLatestFive / steps
        setDisplayCount(step >= steps ? totalLatestFive : Math.floor(current))
        if (step >= steps) clearInterval(counter)
      }, duration / steps)
    }, baseDelay + 150)

    latestExpenses.forEach((_, index) => {
      setTimeout(() => {
        setVisibleItems(prev => [...prev, index])
      }, baseDelay + 350 + index * 110)
    })
  }, [])

  return (
    <div className="relative overflow-hidden" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes blink { 50% { opacity: 0; } }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        .fade-up { animation: fadeUp 0.42s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
        .cursor-blink::after { content: '|'; animation: blink 0.65s step-end infinite; color: #0353a4; }
        .amount-shimmer {
          background: linear-gradient(90deg, #fff 0%, #fff 35%, #93c5fd 50%, #fff 65%, #fff 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 2.5s linear infinite;
        }
        .expense-row:hover { transform: translateX(4px); }
        .expense-row { transition: transform 0.2s ease; }
      `}</style>

      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[1px]"
        style={{ background: "linear-gradient(90deg, transparent, #0353a480, transparent)" }}
      />

      {/* Subtle grid bg */}
      <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "20px 20px" }}
      />

      <div className="relative">

        {/* Title + badge row */}
        <div className="flex items-start justify-between mb-3">
          <div>
            
            <h2 className="text-lg font-semibold text-white min-h-[26px]">
              {titleText}
              {titleText.length < title.length && <span className="cursor-blink" />}
            </h2>
          </div>

          {/* Badge */}
          <div
            className="mt-1"
            style={{ opacity: headerVisible ? 1 : 0, transition: "opacity 0.4s ease" }}
          >
            <span
              className="text-[9px] tracking-widest uppercase px-2 py-1 rounded-md font-medium"
              style={{ background: "rgba(3,83,164,0.15)", color: "#3b82f6", border: "1px solid rgba(3,83,164,0.3)" }}
            >
              Latest 5
            </span>
          </div>
        </div>

        {/* Counter total */}
        <div
          className="flex items-baseline justify-between mb-1 pb-3"
          style={{
            opacity: headerVisible ? 1 : 0,
            transition: "opacity 0.5s ease 0.1s",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <span className="text-white/40 text-[10px] tracking-wide uppercase">Total</span>
          <span className="amount-shimmer text-xl font-bold" style={{ fontFamily: "'DM Mono', monospace" }}>
            $ {displayCount.toLocaleString()}
          </span>
        </div>

        {/* List */}
        <div className="space-y-2">
          {latestExpenses.length === 0 ? (
            <p className="text-xs text-white/30 text-center py-4">No expense records</p>
          ) : (
            latestExpenses.map((item, index) => (
              <div
                key={item.id}
                className="expense-row fade-up flex justify-between items-center px-3 py-2 rounded-xl"
                style={{
                  opacity: 0,
                  animationPlayState: visibleItems.includes(index) ? "running" : "paused",
                  animationFillMode: "forwards",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {/* Left: index dot + category */}
                <div className="flex items-center gap-2">
                  <span
                    className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold"
                    style={{ background: "rgba(3,83,164,0.25)", color: "#3b82f6" }}
                  >
                    {index + 1}
                  </span>
                  <span className="text-white/80 text-xs font-medium">{item.category}</span>
                </div>

                {/* Right: amount */}
                <span
                  className="text-xs font-semibold"
                  style={{ color: "#3b82f6", fontFamily: "'DM Mono', monospace" }}
                >
                  -{Number(item.amount).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  )
}

export default LatestFiveExpenses