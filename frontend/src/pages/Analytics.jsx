import React, { useEffect, useState } from 'react'
import DashBar from '../assets/component/DashBar'
import AnalyticPiChart from '../assets/component/AnalyticPiChart'
import ExpenseAnalaticPichart from '../assets/component/ExpenseAnalaticPichart'
import { auth } from '../firebase'
import { getAllIncomes } from '../services/incomeService'
import { getAllExpenses } from '../services/expenseService'
import InvoiceChatWidget from '../components/InvoiceChat/InvoiceChatWidget';

const Analytics = () => {

  // ── Backend state ────────────────────────────────────────────────
  const [incomes, setIncomes]   = useState([])
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading]   = useState(true)

  // ── Animation state ──────────────────────────────────────────────
  const [loaded, setLoaded] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [incRes, expRes] = await Promise.all([getAllIncomes(), getAllExpenses()])
      console.log('Incomes from backend:', incRes)
      console.log('Expenses from backend:', expRes)
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

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 80)
    return () => clearTimeout(t)
  }, [])

  // ── Backend calculations ─────────────────────────────────────────
  const getTotalByCategory = (data, category) =>
    data.filter(item => item.category === category)
        .reduce((sum, item) => sum + Number(item.amount), 0)

  const totalSalary         = getTotalByCategory(incomes, 'Salary/Wages')
  const totalInvestment     = getTotalByCategory(incomes, 'Investment')
  const totalBusinessIncome = getTotalByCategory(incomes, 'Business Income')
  const totalFreelance      = getTotalByCategory(incomes, 'Freelance/Side hustle')
  const totalOthers         = getTotalByCategory(incomes, 'Others')

  const totalFoodandDrink   = getTotalByCategory(expenses, 'Food & Drink')
  const totalHousing        = getTotalByCategory(expenses, 'Housing')
  const totalTransportation = getTotalByCategory(expenses, 'Transportation')
  const totalBills          = getTotalByCategory(expenses, 'Bills & Utilities')
  const totalHealth         = getTotalByCategory(expenses, 'Health & Medical')

  const formatCurrency = (amount) =>
    Number(amount).toLocaleString('en-LK', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })

  const totalIncome  = totalSalary + totalInvestment + totalBusinessIncome + totalFreelance + totalOthers
  const totalExpense = totalFoodandDrink + totalHousing + totalTransportation + totalBills + totalHealth
  const netBalance   = totalIncome - totalExpense

  // staggered fade-up for each item
  const stagger = (i) => ({
    style: {
      transitionDelay: `${120 + i * 60}ms`,
      transitionProperty: 'opacity, transform',
      transitionDuration: '500ms',
      transitionTimingFunction: 'ease',
      opacity: loaded ? 1 : 0,
      transform: loaded ? 'translateY(0)' : 'translateY(14px)',
    }
  })

  const incomeRows = [
    { label: 'Salary / Wages',          value: totalSalary },
    { label: 'Freelance / Side Hustle', value: totalFreelance },
    { label: 'Business Income',         value: totalBusinessIncome },
    { label: 'Investment',              value: totalInvestment },
    { label: 'Others',                  value: totalOthers },
  ]

  const expenseRows = [
    { label: 'Bills & Utilities',  value: totalBills },
    { label: 'Health & Medical',   value: totalHealth },
    { label: 'Food & Drinks',      value: totalFoodandDrink },
    { label: 'Transportation',     value: totalTransportation },
    { label: 'Housing',            value: totalHousing },
  ]

  return (
    <div className='w-full min-h-screen bg-hero-pattern bg-cover bg-center absolute top-0 left-0'>

      <div className='fixed inset-0 bg-black/60 pointer-events-none' />

      <div className='relative'>

        {/* NAV */}
        <div
          style={{
            opacity: loaded ? 1 : 0,
            transition: 'opacity 400ms ease',
          }}
          className='flex justify-center pt-8'
        >
          <DashBar />
        </div>

        {/* PAGE TITLE — left-aligned, raw, editorial */}
        <div
          style={{
            opacity: loaded ? 1 : 0,
            transform: loaded ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 600ms ease 100ms, transform 600ms ease 100ms',
          }}
          className='max-w-6xl mx-auto px-6 mt-14 mb-2'
        >
          <div className='flex items-baseline gap-4'>
            <h1 className='text-white text-6xl font-black tracking-tighter leading-none'>
              Analytics
            </h1>
            <span className='text-blue-400 text-sm font-mono uppercase tracking-widest mt-1'>
              / overview
            </span>
          </div>
          <div className='h-px bg-blue-500/30 mt-4 mb-0' />
        </div>

        {/* SUMMARY BAR — inline, not pills */}
        <div
          style={{
            opacity: loaded ? 1 : 0,
            transform: loaded ? 'translateY(0)' : 'translateY(12px)',
            transition: 'opacity 500ms ease 250ms, transform 500ms ease 250ms',
          }}
          className='max-w-6xl mx-auto px-6 mt-5 mb-10'
        >
          <div className='flex flex-wrap gap-x-10 gap-y-3'>
            <div>
              <p className='text-blue-400/70 text-xs font-mono uppercase tracking-widest mb-0.5'>income</p>
              <p className='text-white text-2xl font-bold tabular-nums'>Rs {formatCurrency(totalIncome)}</p>
            </div>
            <div className='w-px bg-white/10 self-stretch hidden sm:block' />
            <div>
              <p className='text-blue-300/70 text-xs font-mono uppercase tracking-widest mb-0.5'>expenses</p>
              <p className='text-white text-2xl font-bold tabular-nums'>Rs {formatCurrency(totalExpense)}</p>
            </div>
            <div className='w-px bg-white/10 self-stretch hidden sm:block' />
            <div>
              <p className='text-sky-400/70 text-xs font-mono uppercase tracking-widest mb-0.5'>net balance</p>
              <p className={`text-2xl font-bold tabular-nums ${netBalance >= 0 ? 'text-white' : 'text-blue-300'}`}>
                {netBalance < 0 ? '−' : ''} Rs {formatCurrency(Math.abs(netBalance))}
              </p>
            </div>
          </div>
        </div>

        {/* LOADING */}
        {loading ? (
          <div className='flex justify-center items-center py-32'>
            <div className='flex items-center gap-3'>
              <div className='w-4 h-4 border border-blue-500/40 border-t-blue-400 rounded-full animate-spin' />
              <p className='text-blue-300/60 text-sm font-mono'>loading data...</p>
            </div>
          </div>
        ) : (

          <div className='max-w-6xl mx-auto px-6 pb-20 flex flex-col lg:flex-row gap-10'>

            {/* ── INCOME PANEL ──────────────────────────────────── */}
            <div
              style={{
                opacity: loaded ? 1 : 0,
                transform: loaded ? 'translateX(0)' : 'translateX(-24px)',
                transition: 'opacity 600ms ease 300ms, transform 600ms ease 300ms',
              }}
              className='flex-1'
            >
              {/* Section label */}
              <div className='flex items-center gap-2 mb-5'>
                <span className='w-1 h-5 bg-blue-400 rounded-full inline-block' />
                <span className='text-blue-400 text-xs font-mono uppercase tracking-widest'>Income</span>
              </div>

              {/* Chart area — no card wrapper, just raw */}
              <div className='flex justify-center mb-8'>
                <AnalyticPiChart
                  totalSalary={totalSalary}
                  totalBusinessIncome={totalBusinessIncome}
                  totalFreelance={totalFreelance}
                  totalInvestment={totalInvestment}
                  totalOthers={totalOthers}
                />
              </div>

              {/* Breakdown table */}
              <div className='space-y-0'>
                {incomeRows.map((row, i) => (
                  <div
                    key={row.label}
                    {...stagger(i)}
                    className='flex justify-between items-center py-3 border-b border-white/8
                               hover:pl-2 transition-all duration-200 group cursor-default'
                  >
                    <span className='text-white/60 text-sm group-hover:text-white/90 transition-colors duration-200'>
                      {row.label}
                    </span>
                    <span className='text-white text-sm font-semibold tabular-nums'>
                      Rs {formatCurrency(row.value)}
                    </span>
                  </div>
                ))}

                {/* Total row */}
                <div
                  {...stagger(incomeRows.length)}
                  className='flex justify-between items-center pt-4 mt-1'
                >
                  <span className='text-blue-400 text-xs font-mono uppercase tracking-widest'>Total</span>
                  <span className='text-blue-400 font-bold text-base tabular-nums'>
                    Rs {formatCurrency(totalIncome)}
                  </span>
                </div>
              </div>
            </div>

            {/* Vertical divider — only on lg */}
            <div className='hidden lg:block w-px bg-white/8 self-stretch mx-2' />

            {/* ── EXPENSE PANEL ─────────────────────────────────── */}
            <div
              style={{
                opacity: loaded ? 1 : 0,
                transform: loaded ? 'translateX(0)' : 'translateX(24px)',
                transition: 'opacity 600ms ease 400ms, transform 600ms ease 400ms',
              }}
              className='flex-1'
            >
              {/* Section label */}
              <div className='flex items-center gap-2 mb-5'>
                <span className='w-1 h-5 bg-blue-600 rounded-full inline-block' />
                <span className='text-blue-300 text-xs font-mono uppercase tracking-widest'>Expenses</span>
              </div>

              {/* Chart area */}
              <div className='flex justify-center mb-8'>
                <ExpenseAnalaticPichart
                  totalBills={totalBills}
                  totalFoodandDrink={totalFoodandDrink}
                  totalHealth={totalHealth}
                  totalHousing={totalHousing}
                  totalTransportation={totalTransportation}
                />
              </div>

              {/* Breakdown table */}
              <div className='space-y-0'>
                {expenseRows.map((row, i) => (
                  <div
                    key={row.label}
                    {...stagger(i)}
                    className='flex justify-between items-center py-3 border-b border-white/8
                               hover:pl-2 transition-all duration-200 group cursor-default'
                  >
                    <span className='text-white/60 text-sm group-hover:text-white/90 transition-colors duration-200'>
                      {row.label}
                    </span>
                    <span className='text-white text-sm font-semibold tabular-nums'>
                      Rs {formatCurrency(row.value)}
                    </span>
                  </div>
                ))}

                {/* Total row */}
                <div
                  {...stagger(expenseRows.length)}
                  className='flex justify-between items-center pt-4 mt-1'
                >
                  <span className='text-blue-300 text-xs font-mono uppercase tracking-widest'>Total</span>
                  <span className='text-blue-300 font-bold text-base tabular-nums'>
                    Rs {formatCurrency(totalExpense)}
                  </span>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
      <InvoiceChatWidget />
    </div>
  )
}

export default Analytics