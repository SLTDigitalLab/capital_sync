import React, { useEffect, useState } from 'react'
import DashBar from '../assets/component/DashBar'
import IncomeExpensesChart from '../assets/component/IncomeExpensesChart';
import PiChart from '../assets/component/PiChart';
import { getAllIncomes } from '../services/incomeService'
import { getAllExpenses } from '../services/expenseService'
import { getAllTransactions } from '../services/transactionService';
import { auth } from '../firebase'
import AccountCard from '../assets/component/AccountCard';
import LatesFiveIncomes from '../assets/component/LatesFiveIncomes';
import LatestFiveExpenses from '../assets/component/LatestFiveExpenses';
import InvoiceChatWidget from '../components/InvoiceChat/InvoiceChatWidget';

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

const Skeleton = ({ className }) => (
  <div className={`relative overflow-hidden bg-white/10 rounded-[20px] ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
  </div>
)

const Home = () => {
  const [incomes,  setIncomes]  = useState([])
  const [expenses, setExpenses] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [activeMonth, setActiveMonth] = useState("One Month")
  const [loaded, setLoaded] = useState(false)

  useEffect(() => { setLoaded(true) }, [])

  // ── FETCH ────────────────────────────────────────────────────────
  const fetchData = async () => {
    setLoading(true)
    try {
      const [incRes, expRes] = await Promise.all([getAllIncomes(), getAllExpenses()])
      setIncomes(Array.isArray(incRes) ? incRes : [])
      setExpenses(Array.isArray(expRes) ? expRes : [])
    } catch (err) {
      console.error('Error fetching incomes/expenses', err)
      setIncomes([])
      setExpenses([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (user) fetchData()
      else {
        setIncomes([])
        setExpenses([])
        setLoading(false)
      }
    })
    return () => unsub()
  }, [])

  // ── TRANSACTIONS ─────────────────────────────────────────────────
  const [transactions, setTransactions] = useState([])
  const [toast, setToast] = useState(null)

  useEffect(() => { fetchTransactions() }, [])

  const fetchTransactions = async () => {
    try {
      const data = await getAllTransactions()
      setTransactions(data)
    } catch (error) {
      console.error('Error fetching transactions:', error)
      setToast({ message: error.message || 'Failed to load transactions', type: 'error' })
    }
  }

  // ── DATE FILTER ──────────────────────────────────────────────────
  const getStartDate = (filter) => {
    const now = new Date()
    const start = new Date()
    switch (filter) {
      case "One Month":   start.setMonth(now.getMonth() - 1);       break
      case "Three Month": start.setMonth(now.getMonth() - 3);       break
      case "Six Month":   start.setMonth(now.getMonth() - 6);       break
      case "One Year":    start.setFullYear(now.getFullYear() - 1); break
      case "Five Year":   start.setFullYear(now.getFullYear() - 5); break
      case "Life Time":   return null
      default:            start.setMonth(now.getMonth() - 1)
    }
    return start
  }

  const filterByDate = (items, filter) => {
    const startDate = getStartDate(filter)
    if (!startDate) return items
    return items.filter(item => {
      const d = new Date(item.date)
      return !isNaN(d) && d >= startDate
    })
  }

  const filteredIncomes  = filterByDate(incomes,  activeMonth)
  const filteredExpenses = filterByDate(expenses, activeMonth)

  // ── TOTALS ───────────────────────────────────────────────────────
  const getTotal = (data, category) =>
    data.filter(i => i.category === category)
        .reduce((s, i) => s + Number(i.amount), 0)

  const totalSalary          = getTotal(incomes,  "Salary/Wages")
  const totalInvestment      = getTotal(incomes,  "Investment")
  const totalBusinessIncome  = getTotal(incomes,  "Business Income")
  const totalFoodandDrink    = getTotal(expenses, "Food & Drink")
  const totalHousing         = getTotal(expenses, "Housing")
  const totalTransportation  = getTotal(expenses, "Transportation")

  const totalIncome  = filteredIncomes.reduce((s, i) => s + Number(i.amount || 0), 0)
  const totalExpense = filteredExpenses.reduce((s, e) => s + Number(e.amount || 0), 0)

  const mainAccountBalance =
    incomes.reduce((s, i) => s + Number(i.amount || 0), 0) -
    expenses.reduce((s, e) => s + Number(e.amount || 0), 0)

  // ── CHART DATA BUILDER ───────────────────────────────────────────
  const buildChartData = (incItems, expItems, filter) => {
    const now = new Date()

    const dailySlots = (daysBack) => {
      const slots = []
      for (let i = daysBack - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
        slots.push({
          key:   d.toISOString().slice(0, 10),
          label: `${d.getDate()} ${monthNames[d.getMonth()]}`,
          income: 0, expenses: 0,
        })
      }
      incItems.forEach(item => {
        const key = new Date(item.date).toISOString().slice(0, 10)
        const s = slots.find(s => s.key === key)
        if (s) s.income += Number(item.amount || 0)
      })
      expItems.forEach(item => {
        const key = new Date(item.date).toISOString().slice(0, 10)
        const s = slots.find(s => s.key === key)
        if (s) s.expenses += Number(item.amount || 0)
      })
      return slots
    }

    const groupDays = (slots, chunkSize) => {
      const grouped = []
      for (let i = 0; i < slots.length; i += chunkSize) {
        const chunk = slots.slice(i, i + chunkSize)
        grouped.push({
          month:    chunk[0].label,
          income:   chunk.reduce((s, c) => s + c.income,   0),
          expenses: chunk.reduce((s, c) => s + c.expenses, 0),
        })
      }
      return grouped
    }

    const monthlySlots = (monthsBack) => {
      const slots = []
      for (let i = monthsBack; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        slots.push({
          monthIndex: d.getMonth(),
          year:       d.getFullYear(),
          label:      d.getFullYear() === now.getFullYear()
                        ? monthNames[d.getMonth()]
                        : `${monthNames[d.getMonth()]} ${d.getFullYear()}`,
          income: 0, expenses: 0,
        })
      }
      incItems.forEach(item => {
        const d = new Date(item.date)
        if (isNaN(d)) return
        const s = slots.find(s => s.monthIndex === d.getMonth() && s.year === d.getFullYear())
        if (s) s.income += Number(item.amount || 0)
      })
      expItems.forEach(item => {
        const d = new Date(item.date)
        if (isNaN(d)) return
        const s = slots.find(s => s.monthIndex === d.getMonth() && s.year === d.getFullYear())
        if (s) s.expenses += Number(item.amount || 0)
      })
      return slots.map(s => ({ month: s.label, income: s.income, expenses: s.expenses }))
    }

    const yearlySlots = (yearsBack) => {
      const slots = []
      for (let i = yearsBack; i >= 0; i--) {
        slots.push({
          year: now.getFullYear() - i,
          label: String(now.getFullYear() - i),
          income: 0, expenses: 0,
        })
      }
      incItems.forEach(item => {
        const d = new Date(item.date)
        if (isNaN(d)) return
        const s = slots.find(s => s.year === d.getFullYear())
        if (s) s.income += Number(item.amount || 0)
      })
      expItems.forEach(item => {
        const d = new Date(item.date)
        if (isNaN(d)) return
        const s = slots.find(s => s.year === d.getFullYear())
        if (s) s.expenses += Number(item.amount || 0)
      })
      return slots.map(s => ({ month: s.label, income: s.income, expenses: s.expenses }))
    }

    switch (filter) {
      case "One Month":   return groupDays(dailySlots(30), 5)
      case "Three Month": return groupDays(dailySlots(90), 15)
      case "Six Month":   return monthlySlots(6)
      case "One Year":    return monthlySlots(12)
      case "Five Year":   return yearlySlots(5)
      case "Life Time": {
        const allItems = [...incomes, ...expenses]
        if (allItems.length === 0) return []
        const earliest = allItems.reduce((min, item) => {
          const d = new Date(item.date)
          return !isNaN(d) && d < min ? d : min
        }, new Date())
        const slots = []
        const cursor = new Date(earliest.getFullYear(), earliest.getMonth(), 1)
        const end    = new Date(now.getFullYear(), now.getMonth(), 1)
        while (cursor <= end) {
          slots.push({
            monthIndex: cursor.getMonth(),
            year:       cursor.getFullYear(),
            label:      `${monthNames[cursor.getMonth()]} ${cursor.getFullYear()}`,
            income: 0, expenses: 0,
          })
          cursor.setMonth(cursor.getMonth() + 1)
        }
        incItems.forEach(item => {
          const d = new Date(item.date)
          if (isNaN(d)) return
          const s = slots.find(s => s.monthIndex === d.getMonth() && s.year === d.getFullYear())
          if (s) s.income += Number(item.amount || 0)
        })
        expItems.forEach(item => {
          const d = new Date(item.date)
          if (isNaN(d)) return
          const s = slots.find(s => s.monthIndex === d.getMonth() && s.year === d.getFullYear())
          if (s) s.expenses += Number(item.amount || 0)
        })
        return slots.map(s => ({ month: s.label, income: s.income, expenses: s.expenses }))
      }
      default: return monthlySlots(1)
    }
  }

  const chartData = buildChartData(filteredIncomes, filteredExpenses, activeMonth)

  const sortByLatest = (a, b) => new Date(b.created_at) - new Date(a.created_at)
  const latestIncomes  = [...incomes].sort(sortByLatest).slice(0, 5)
  const latestExpenses = [...expenses].sort(sortByLatest).slice(0, 5)

  const monthFilters = ["One Month", "Three Month", "Six Month", "One Year", "Five Year", "Life Time"]

  return (
    <div className="min-h-screen bg-gradient-to-l from-[#016394] to-[#6845FB] bg-cover bg-center bg-fixed">
      <style>{`
        @keyframes shimmer { 100% { transform: translateX(100%); } }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-slide-up { animation: fadeSlideUp 0.5s ease forwards; }
        .stagger-1 { animation-delay: 0.05s; opacity: 0; }
        .stagger-2 { animation-delay: 0.15s; opacity: 0; }
        .stagger-3 { animation-delay: 0.25s; opacity: 0; }
        .stagger-4 { animation-delay: 0.35s; opacity: 0; }
      `}</style>

      <div className="fixed inset-0 bg-black/50 pointer-events-none" />

      <div className={`relative transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}>

        {/* ── NAV ───────────────────────────────────────────────── */}
        <div className="flex justify-center pt-6">
          <div className="fade-slide-up stagger-1">
            <DashBar />
          </div>
        </div>

        <div className="w-full max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 pb-10">

          {loading ? (
            /* ── SKELETON ─────────────────────────────────────── */
            <div className="mt-8 sm:mt-12 animate-pulse space-y-4">
              {/* Mobile: stack, Desktop: side by side */}
              <div className="flex flex-col lg:flex-row gap-4">
                <Skeleton className="w-full lg:w-[365px] h-[220px] sm:h-[300px] lg:h-[420px]" />
                <div className="flex flex-col gap-4 flex-1">
                  {/* filter pills skeleton */}
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    {Array(6).fill(0).map((_, i) => (
                      <Skeleton key={i} className="flex-1 min-w-[80px] h-[40px] sm:h-[44px] rounded-[56px]" />
                    ))}
                  </div>
                  <Skeleton className="w-full h-[220px] sm:h-[280px] lg:h-[325px]" />
                </div>
              </div>
              {/* Row 2 skeleton */}
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <Skeleton className="w-full sm:w-1/2 lg:w-[695px] h-[220px] sm:h-[280px] lg:h-[320px]" />
                <Skeleton className="w-full sm:w-1/4 lg:w-[395px] h-[180px] sm:h-[280px] lg:h-[320px]" />
                <Skeleton className="w-full sm:w-1/4 lg:w-[395px] h-[180px] sm:h-[280px] lg:h-[320px]" />
              </div>
            </div>

          ) : (
            <>
              {/* ── ROW 1 ─────────────────────────────────────── */}
              <div className="mt-8 sm:mt-12 flex flex-col lg:flex-row items-start gap-4 sm:gap-[15px] fade-slide-up stagger-2">

                {/* Account Card — full width on mobile, fixed on desktop */}
                <div className="w-full lg:w-[365px] shrink-0">
                  <AccountCard
                    mainAccountBalance={mainAccountBalance}
                    totalSalary={totalSalary}
                    totalInvestment={totalInvestment}
                    totalBusinessIncome={totalBusinessIncome}
                    totalFoodandDrink={totalFoodandDrink}
                    totalHousing={totalHousing}
                    totalTransportation={totalTransportation}
                    
                  />
                </div>

                {/* Chart column */}
                <div className="flex-1 w-full min-w-0">

                  {/* Filter pills — wrap on small screens, row on large */}
                  <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-2">
                    {monthFilters.map((label) => (
                      <div
                        key={label}
                        onClick={() => setActiveMonth(label)}
                        className={`h-[40px] sm:h-[44px] rounded-[56px] flex items-center justify-center
                          text-white text-xs sm:text-sm cursor-pointer transition duration-300 px-2 text-center
                          ${activeMonth === label
                            ? "bg-gradient-to-r from-blue-500 to-purple-500"
                            : "outline outline-white hover:outline-blue-500 hover:text-blue-500"
                          }`}
                      >
                        <p className="leading-tight">{label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Bar chart */}
                  <div
                    key={activeMonth + "-bar"}
                    className="w-full h-[220px] sm:h-[270px] md:h-[300px] lg:h-[325px]
                               bg-black/50 rounded-[20px] mt-3 sm:mt-[28px] shadow-md
                               hover:bg-black/30 hover:shadow-2xl transition duration-300
                               fade-slide-up stagger-1"
                  >
                    <IncomeExpensesChart data={chartData} filter={activeMonth} />
                  </div>
                </div>
              </div>

              {/* ── ROW 2 ─────────────────────────────────────── */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-[10px] mt-3 sm:mt-[15px] fade-slide-up stagger-3">

                {/* Pie chart */}
                <div
                  key={activeMonth + "-pie"}
                  className="w-full sm:flex-1 h-[260px] sm:h-[280px] lg:h-[320px]
                              rounded-[20px] fade-slide-up stagger-1 hover:bg-black/30 hover:shadow-2xl transition duration-300"
                >
                  <PiChart totalIncome={totalIncome} totalExpense={totalExpense} />
                </div>

                {/* Placeholder cards */}
                <div className='w-[400px] h-[320px] rounded-2xl bg-black/50 px-[30px] py-[15px]'><LatesFiveIncomes latestIncomes={latestIncomes} totalIncome={totalIncome} /></div>
                <div className='w-[400px] h-[320px] rounded-2xl bg-black/50 px-[30px] py-[15px]'><LatestFiveExpenses latestExpenses={latestExpenses} totalExpense={totalExpense} /></div>
              </div>
            </>
          )}

        </div>
      </div>
      <InvoiceChatWidget />
    </div>
  )
}

export default Home