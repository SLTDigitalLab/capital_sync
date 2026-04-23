import { useRef, useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, Cell
} from 'recharts'

const IncomeExpensesChart = ({ data, filter }) => {
  const scrollRef = useRef(null)
  const isDragging = useRef(false)
  const startX = useRef(0)
  const scrollLeft = useRef(0)
  const hasAnimated = useRef(false)

  const [titleText, setTitleText] = useState("")
  const [subtitleVisible, setSubtitleVisible] = useState(false)
  const [chartVisible, setChartVisible] = useState(false)
  const [animatedBars, setAnimatedBars] = useState([])

  const title = "Income vs Expenses"

  // ── Mouse drag ──
  const onMouseDown = (e) => {
    isDragging.current = true
    startX.current = e.pageX - scrollRef.current.offsetLeft
    scrollLeft.current = scrollRef.current.scrollLeft
    scrollRef.current.style.cursor = 'grabbing'
  }
  const onMouseUp = () => {
    isDragging.current = false
    if (scrollRef.current) scrollRef.current.style.cursor = 'grab'
  }
  const onMouseMove = (e) => {
    if (!isDragging.current) return
    e.preventDefault()
    const x = e.pageX - scrollRef.current.offsetLeft
    scrollRef.current.scrollLeft = scrollLeft.current - (x - startX.current) * 1.5
  }
  const onMouseLeave = () => {
    isDragging.current = false
    if (scrollRef.current) scrollRef.current.style.cursor = 'grab'
  }

  // ── Touch drag ──
  const touchStart = useRef(0)
  const touchScrollLeft = useRef(0)
  const onTouchStart = (e) => {
    touchStart.current = e.touches[0].pageX
    touchScrollLeft.current = scrollRef.current.scrollLeft
  }
  const onTouchMove = (e) => {
    scrollRef.current.scrollLeft = touchScrollLeft.current + (touchStart.current - e.touches[0].pageX) * 1.5
  }

  // ── Auto-scroll to end ──
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollLeft = scrollRef.current.scrollWidth
  }, [data, filter])

  // ── Entrance animations ──
  useEffect(() => {
    if (hasAnimated.current) return
    hasAnimated.current = true

    let i = 0
    const typeInterval = setInterval(() => {
      setTitleText(title.slice(0, i + 1))
      i++
      if (i === title.length) clearInterval(typeInterval)
    }, 55)

    setTimeout(() => setSubtitleVisible(true), title.length * 55 + 100)
    setTimeout(() => setChartVisible(true), title.length * 55 + 300)

    const chartData = Array.isArray(data) && data.length ? data : []
    chartData.forEach((_, index) => {
      setTimeout(() => {
        setAnimatedBars(prev => [...prev, index])
      }, title.length * 55 + 500 + index * 60)
    })
  }, [])

  const chartData = Array.isArray(data) && data.length ? data : []

  const BAR_SIZE = 22
  const GROUP_WIDTH = 90
  const Y_AXIS_WIDTH = 50
  const MIN_WIDTH = 1110
  const chartWidth = Math.max(chartData.length * GROUP_WIDTH + Y_AXIS_WIDTH, MIN_WIDTH)

  const filterLabel = {
    "One Month":   "Daily view · 5-day groups",
    "Three Month": "15-day groups",
    "Six Month":   "Monthly view",
    "One Year":    "Monthly view",
    "Five Year":   "Yearly view",
    "Life Time":   "All time monthly",
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ fontFamily: "'DM Mono', monospace", background: "rgba(0,0,0,0.85)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(10px)" }}
          className="px-4 py-3 rounded-xl shadow-2xl text-xs"
        >
          <p className="text-white/50 text-[10px] tracking-widest uppercase mb-2">{label}</p>
          {payload.map((p, i) => (
            <div key={i} className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full" style={{ background: p.fill }} />
              <span className="text-white/60 capitalize">{p.name}</span>
              <span className="font-semibold ml-auto pl-4" style={{ color: p.fill }}>
                ${Number(p.value).toLocaleString()}
              </span>
            </div>
          ))}
          {payload.length === 2 && (
            <div className="border-t border-white/10 mt-2 pt-2 flex justify-between">
              <span className="text-white/30 text-[10px]">Net</span>
              <span className={`text-[10px] font-bold ${payload[0].value >= payload[1].value ? 'text-[#8080FF]' : 'text-[#0353a4]'}`}>
                ${Math.abs(payload[0].value - payload[1].value).toLocaleString()}
              </span>
            </div>
          )}
        </div>
      )
    }
    return null
  }

  const CustomBar = (props) => {
    const { x, y, width, height, fill, index } = props
    const visible = animatedBars.includes(index)
    return (
      <rect
        x={x} y={visible ? y : y + height}
        width={width}
        height={visible ? height : 0}
        fill={fill}
        rx={4} ry={4}
        style={{ transition: "all 0.5s cubic-bezier(0.22, 1, 0.36, 1)" }}
      />
    )
  }

  return (
    <div className="w-full h-full rounded-xl px-4 pt-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes blink { 50% { opacity: 0; } }
        .chart-fade-up { animation: fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) forwards; }
        .cursor-blink::after { content: '|'; animation: blink 0.65s step-end infinite; color: #8080FF; }
        div::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-white/30 text-[9px] tracking-[0.2em] uppercase mb-1">Analytics</p>
          <p className="text-white font-semibold text-lg min-h-[28px]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            {titleText}
            {titleText.length < title.length && <span className="cursor-blink" />}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2"
          style={{ opacity: subtitleVisible ? 1 : 0, transition: "opacity 0.5s ease" }}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#8080FF]" />
              <span className="text-white/50 text-[10px]">Income</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#0353a4]" />
              <span className="text-white/50 text-[10px]">Expenses</span>
            </div>
          </div>
          <p className="text-[#8080FF]/70 text-[9px] tracking-wide italic">
            {filterLabel[filter] || ""} · drag to scroll
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent mb-4"
        style={{ opacity: subtitleVisible ? 1 : 0, transition: "opacity 0.5s ease 0.1s" }}
      />

      {/* Chart */}
      <div
        className="chart-fade-up"
        style={{ opacity: 0, animationPlayState: chartVisible ? "running" : "paused", animationFillMode: "forwards" }}
      >
        <div
          ref={scrollRef}
          className="overflow-x-auto overflow-y-hidden"
          style={{ cursor: 'grab', userSelect: 'none', height: '210px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
        >
          <div style={{ width: chartWidth, height: '200px' }}>
            <BarChart
              width={chartWidth} height={200}
              data={chartData}
              barCategoryGap="30%" barGap={4}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontFamily: "'DM Mono', monospace" }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tickLine={false} interval={0}
              />
              <YAxis
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontFamily: "'DM Mono', monospace" }}
                axisLine={false} tickLine={false}
                tickFormatter={(v) => v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`}
                width={Y_AXIS_WIDTH}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)', radius: 4 }} />
              <Bar dataKey="income" fill="#8080FF" radius={[4,4,0,0]} barSize={BAR_SIZE} shape={<CustomBar />} />
              <Bar dataKey="expenses" fill="#0353a4" radius={[4,4,0,0]} barSize={BAR_SIZE} shape={<CustomBar />} />
            </BarChart>
          </div>
        </div>
      </div>
    </div>
  )
}

export default IncomeExpensesChart