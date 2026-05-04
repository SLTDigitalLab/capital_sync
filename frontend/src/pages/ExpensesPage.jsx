import React, { useState, useEffect } from 'react'
import DashBar from '../assets/component/DashBar'
import ExpenseDetails from '../assets/component/ExpenseDetails'
import ExpenseTitle from '../assets/component/ExpenseTitle'
import ExpenseAmount from '../assets/component/ExpenseAmount'
import ExpenseSelect from '../assets/component/ExpenseSelect'
import ExpneseCalander from '../assets/component/ExpneseCalander'
import ExpenseSourceSelect from '../assets/component/ExpenseSourceSelect'
import ExpenseNotes from '../assets/component/ExpenseNotes'
import AddButton from '../assets/component/AddButton'
import Toast from '../assets/component/Toast'
import { createExpense } from '../services/expenseService'
import InvoiceChatWidget from '../components/InvoiceChat/InvoiceChatWidget';

const ExpensesPage = () => {

  // ── Backend state ────────────────────────────────────────────────
  const [title, setTitle]                   = useState('');
  const [expenseAmount, setExpenseAmount]   = useState('');
  const [category, setCategory]             = useState('');
  const [paymentMethod, setPaymentMethod]   = useState('');
  const [date, setDate]                     = useState('');
  const [notes, setNotes]                   = useState('');
  const [loading, setLoading]               = useState(false);
  const [toast, setToast]                   = useState(null);

  // ── Animation state ──────────────────────────────────────────────
  const [loaded, setLoaded]         = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [typedText, setTypedText]   = useState('');
  const [modalOpen, setModalOpen]   = useState(false);

  const fullText = 'Track your Expenses and Payment Sources';

  useEffect(() => {
    const t1 = setTimeout(() => setLoaded(true), 50);
    const t2 = setTimeout(() => setDataLoaded(true), 1800);

    let i = 0;
    const t3 = setTimeout(() => {
      const iv = setInterval(() => {
        i++;
        setTypedText(fullText.slice(0, i));
        if (i >= fullText.length) clearInterval(iv);
      }, 40);
    }, 800);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  // ── Animation helpers ────────────────────────────────────────────
  const fadeUp = (delay = '0ms') => ({
    style: {
      transitionDelay: delay,
      transitionProperty: 'opacity, transform',
      transitionDuration: '600ms',
      transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
      opacity: loaded ? 1 : 0,
      transform: loaded ? 'translateY(0px)' : 'translateY(24px)',
    },
  });

  const slideLeft = (delay = '0ms') => ({
    style: {
      transitionDelay: delay,
      transitionProperty: 'opacity, transform',
      transitionDuration: '700ms',
      transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
      opacity: loaded ? 1 : 0,
      transform: loaded ? 'translateX(0px)' : 'translateX(-60px)',
    },
  });

  const slideRight = (delay = '0ms') => ({
    style: {
      transitionDelay: delay,
      transitionProperty: 'opacity, transform',
      transitionDuration: '700ms',
      transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
      opacity: loaded ? 1 : 0,
      transform: loaded ? 'translateX(0px)' : 'translateX(60px)',
    },
  });

  // ── Submit handler ───────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!title || !expenseAmount || !category || !date) {
      setToast({ message: 'Please fill in all required fields', type: 'error' });
      return;
    }
    if (parseFloat(expenseAmount) <= 0) {
      setToast({ message: 'Amount must be greater than 0', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const expenseData = {
        title,
        amount: parseFloat(expenseAmount),
        category,
        payment_method: paymentMethod || null,
        note: notes || null,
        date: new Date(date).toISOString(),
      };
      await createExpense(expenseData);
      setModalOpen(true);
      setTitle('');
      setExpenseAmount('');
      setCategory('');
      setPaymentMethod('');
      setDate('');
      setNotes('');
    } catch (error) {
      console.error('Error creating expense:', error);
      setToast({
        message: error.message || 'Failed to add expense. Please try again.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='pattern w-full min-h-screen bg-center bg-cover absolute top-0 left-0'>

      {/* Dark overlay */}
      <div className='fixed inset-0 bg-black/50 pointer-events-none' />

      {/* ── SUCCESS MODAL ────────────────────────────────────────── */}
      {modalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60'>
          <div
            style={{
              opacity: modalOpen ? 1 : 0,
              transform: modalOpen ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(20px)',
              transition: 'opacity 300ms ease, transform 300ms ease',
            }}
            className='bg-gray-900 border border-white/10 rounded-2xl p-10 w-[400px] shadow-2xl'
          >
            <h2 className='text-white text-xl font-bold mb-3'>Expense Added! 🎉</h2>
            <p className='text-gray-400 mb-6'>Your expense entry has been saved successfully.</p>
            <button
              onClick={() => setModalOpen(false)}
              className='px-6 py-2 bg-blue-500 text-white rounded-3xl hover:bg-blue-600 transition w-full'
            >
              Done
            </button>
          </div>
        </div>
      )}

      <div className='relative'>

        {/* NAV */}
        <div className='flex justify-center pt-8' {...fadeUp('0ms')}>
          <DashBar />
        </div>

        {/* MAIN CONTENT */}
        <div className='flex justify-center gap-10 mt-16 px-8 pb-16 flex-wrap lg:flex-nowrap'>

          {/* ── LEFT SIDE ─────────────────────────────────────────── */}
          <div className='flex flex-col'>

            {/* Heading */}
            <p className='text-white font-bold text-[80px] leading-none' {...fadeUp('200ms')}>
              Expenses
            </p>

            {/* Typewriter subtitle */}
            <p className='text-white text-[20px] mb-[55px]' {...fadeUp('350ms')}>
              {typedText}
              <span style={{ animation: 'blink 1s step-end infinite' }} className='text-blue-400'>|</span>
            </p>

            {/* Flip card image */}
            <div
              {...slideLeft('500ms')}
              style={{
                ...slideLeft('500ms').style,
                perspective: '1200px',
                display: 'inline-block',
              }}
            >
              <div className='flip-card'>
                <div className='flip-card-inner'>

                  {/* Front */}
                  <div className='flip-card-front'>
                    <img src='/income.png' alt='Expenses' />
                  </div>

                  {/* Back */}
                  <div className='flip-card-back'>
                    <div className='flip-card-back-content'>
                      <span style={{ fontSize: '52px', lineHeight: 1 }}>💸</span>
                      <p style={{ color: '#fff', fontSize: '26px', fontWeight: '700', margin: '0', lineHeight: '1.2' }}>
                        Track Your Expenses
                      </p>
                      <p style={{ color: '#93c5fd', fontSize: '15px', margin: '0', lineHeight: '1.7', maxWidth: '280px', textAlign: 'center' }}>
                        Log every payment, categorise your spending, and take full control of where your money goes.
                      </p>
                      <div style={{
                        padding: '8px 24px',
                        background: 'rgba(59,130,246,0.25)',
                        border: '1px solid rgba(96,165,250,0.5)',
                        borderRadius: '999px',
                        color: '#60a5fa',
                        fontSize: '12px',
                        fontWeight: '700',
                        letterSpacing: '0.1em',
                      }}>
                        CAPITAL SYNC
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT SIDE — Form card ─────────────────────────────── */}
          <div
            className='w-full lg:w-[555px] bg-black/50 rounded-3xl px-[48px] py-[48px]'
            {...slideRight('400ms')}
          >
            {/* Skeleton loader */}
            {!dataLoaded ? (
              <div className='space-y-6'>
                <p className='text-white font-semibold mb-2'>Loading form...</p>
                {[...Array(6)].map((_, i) => (
                  <div key={i}>
                    <div className='h-4 w-20 bg-white/20 rounded animate-pulse mb-2' />
                    <div className='h-[50px] w-full bg-white/10 rounded-2xl animate-pulse' />
                  </div>
                ))}
                <div className='flex justify-center'>
                  <div className='h-10 w-32 bg-blue-500/30 rounded-3xl animate-pulse mt-6' />
                </div>
              </div>
            ) : (
              /* Form fades + scales in after skeleton */
              <div
                style={{
                  opacity: dataLoaded ? 1 : 0,
                  transform: dataLoaded ? 'scale(1)' : 'scale(0.97)',
                  transition: 'opacity 400ms ease, transform 400ms ease',
                }}
              >
                <p className='text-[#0353a4] text-sm mb-6'>Track your expenses and sources</p>

                <ExpenseDetails text='Title' />
                <ExpenseTitle title={title} setTitle={setTitle} />

                <ExpenseDetails text='Amount' />
                <ExpenseAmount expenseAmount={expenseAmount} setExpenseAmount={setExpenseAmount} />

                <ExpenseDetails text='Category' />
                <ExpenseSelect value={category} onChange={setCategory} />

                <ExpenseDetails text='Date' />
                <ExpneseCalander value={date} onChange={setDate} />

                <ExpenseDetails text='Payment Method' />
                <ExpenseSourceSelect value={paymentMethod} onChange={setPaymentMethod} />

                <ExpenseDetails text='Note (Optional)' />
                <ExpenseNotes notes={notes} setNotes={setNotes} />

                <div className='flex justify-center mt-6'>
                  <AddButton text='Add Expenses' onClick={handleSubmit} loading={loading} />
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Toast — for errors */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }

        .flip-card {
          display: inline-block;
        }

        .flip-card-inner {
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
          will-change: transform;
        }

        .flip-card:hover .flip-card-inner {
          transform: rotateY(180deg);
        }

        .flip-card-front,
        .flip-card-back {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          transform: translateZ(0);
          -webkit-transform: translateZ(0);
        }

        .flip-card-front img {
          display: block;
          border-radius: 16px;
          max-width: 420px;
          width: 100%;
        }

        .flip-card-back {
          position: absolute;
          inset: 0;
          transform: rotateY(180deg) translateZ(0);
          -webkit-transform: rotateY(180deg) translateZ(0);
          background: rgba(0, 0, 0, 0.82);
          border: 1px solid rgba(96, 165, 250, 0.35);
          border-radius: 16px;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        .flip-card-back-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          padding: 40px 32px;
          height: 100%;
          text-align: center;
        }
      `}</style>
      <InvoiceChatWidget /> 
    </div>
  );
};

export default ExpensesPage;