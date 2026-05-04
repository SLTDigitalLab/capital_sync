import React, { useState, useEffect } from 'react';
import DashBar from '../assets/component/DashBar';
import Toast from '../assets/component/Toast';
import SearchBar from '../assets/component/SearchBar';
import apiClient from '../services/apiClient';
import { getAllTransactions } from '../services/transactionService';
import InvoiceChatWidget from '../components/InvoiceChat/InvoiceChatWidget';

// ── Skeleton (copied from Home) ──────────────────────────────────
const Skeleton = ({ className }) => (
  <div className={`relative overflow-hidden bg-white/10 rounded-[20px] ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
  </div>
)

const TransactionPage = () => {

  // ── Backend state ────────────────────────────────────────────────
  const [transactions, setTransactions]   = useState([]);
  const [loading, setLoading]             = useState(true);
  const [toast, setToast]                 = useState(null);
  const [searchFilters, setSearchFilters] = useState({ category: '', date: '', type: '', price: '' });
  const [categories, setCategories]       = useState([]);
  const [currentPage, setCurrentPage]     = useState(1);
  const [totalPages, setTotalPages]       = useState(1);
  const transactionsPerPage               = 50;

  // ── Animation state ──────────────────────────────────────────────
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setLoaded(true) }, []);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await apiClient.get('/api/categories/');
        setCategories(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error('Failed to fetch categories', error);
      }
    };
    fetchCategories();
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => { setCurrentPage(1); }, [searchFilters]);

  // Fetch transactions
  useEffect(() => {
    fetchTransactions(currentPage, searchFilters);
  }, [currentPage, searchFilters]);

  const fetchTransactions = async (page = 1, filters = {}) => {
    setLoading(true);
    try {
      const data = await getAllTransactions(page, transactionsPerPage, filters);
      setTransactions(data.items || []);
      setTotalPages(data.total_pages || 1);
    } catch (error) {
      setToast({ message: error.message || 'Failed to load transactions', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const formatAmount = (amount, type) => {
    const prefix = type === 'income' ? '+' : '-';
    const color  = type === 'income' ? 'text-[#8080FF]' : 'text-[#4a9ede]';
    return <span className={`${color} font-semibold`}>{prefix}${parseFloat(amount).toFixed(2)}</span>;
  };

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

      <div className={`relative pt-0 transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}>

        {/* NAV */}
        <div className="flex justify-center pt-8">
          <div className="fade-slide-up stagger-1">
            <DashBar />
          </div>
        </div>

        <div className="flex justify-center">
          <div className="mt-12 w-[1515px] px-4">

            {/* PAGE TITLE */}
            <div className="fade-slide-up stagger-1 mb-6">
              <h1 className="text-white text-5xl font-black tracking-tighter leading-none">
                Transactions
              </h1>
              <div className="h-px bg-white/15 mt-4" />
            </div>

            {/* SEARCH BAR */}
            <div className="fade-slide-up stagger-2 mb-6">
              <SearchBar
                searchFilters={searchFilters}
                setSearchFilters={setSearchFilters}
                categories={categories}
              />
            </div>

            {loading ? (
              /* SKELETON — same style as Home */
              <div className="animate-pulse space-y-3">
                {/* header skeleton */}
                <Skeleton className="w-full h-[48px] rounded-[20px]" />
                {/* row skeletons */}
                {[...Array(8)].map((_, i) => (
                  <Skeleton key={i} className="w-full h-[64px] rounded-[20px]" />
                ))}
              </div>

            ) : transactions.length === 0 ? (
              <div className="fade-slide-up stagger-2">
                <div className="w-full bg-black/50 rounded-[20px] py-16 flex flex-col items-center gap-3">
                  <p className="text-white/40 text-4xl">◎</p>
                  <p className="text-white/60 text-base">No transactions found.</p>
                </div>
              </div>

            ) : (
              <div className="fade-slide-up stagger-3">

                {/* TABLE */}
                <div className="w-full bg-black/50 rounded-[20px] overflow-hidden hover:bg-black/40 transition duration-300">

                  {/* Header */}
                  <div className="flex justify-between px-6 py-4 border-b border-white/10">
                    <div className="flex-1 text-white/50 text-xs font-mono uppercase tracking-widest">Title</div>
                    <div className="w-36 text-center text-white/50 text-xs font-mono uppercase tracking-widest">Category</div>
                    <div className="w-32 text-center text-white/50 text-xs font-mono uppercase tracking-widest">Date</div>
                    <div className="w-32 text-right text-white/50 text-xs font-mono uppercase tracking-widest">Amount</div>
                  </div>

                  {/* Rows */}
                  <div>
                    {transactions.map((transaction, index) => (
                      <div
                        key={transaction.id}
                        style={{
                          animationDelay: `${0.02 * index}s`,
                          opacity: 0,
                        }}
                        className={`
                          flex justify-between items-center px-6 py-4 text-white
                          hover:bg-white/5 transition-all duration-200 cursor-default
                          fade-slide-up
                          ${index !== transactions.length - 1 ? 'border-b border-white/6' : ''}
                        `}
                      >
                        {/* Title + type badge */}
                        <div className="flex-1 flex items-center gap-3">
                          <span className="font-medium text-white/90">
                            {transaction.title || 'Untitled'}
                          </span>
                          <span className={`text-xs px-2.5 py-0.5 rounded-full font-mono
                            ${transaction.type === 'income'
                              ? 'bg-[#8080FF]/20 text-[#8080FF]'
                              : 'bg-[#016394]/30 text-[#4a9ede]'
                            }`}>
                            {transaction.type}
                          </span>
                        </div>

                        {/* Category */}
                        <div className="w-36 text-center text-white/50 text-sm">
                          {transaction.category}
                        </div>

                        {/* Date */}
                        <div className="w-32 text-center text-white/40 text-sm font-mono">
                          {formatDate(transaction.date)}
                        </div>

                        {/* Amount */}
                        <div className="w-32 text-right text-sm">
                          {formatAmount(transaction.amount, transaction.type)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* PAGINATION */}
                <div className="flex justify-between items-center mt-5 fade-slide-up stagger-4">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-5 py-2 rounded-[56px] text-white text-sm font-medium
                               outline outline-white/20 hover:outline-blue-400 hover:text-blue-400
                               disabled:opacity-30 disabled:cursor-not-allowed
                               transition duration-200"
                  >
                    ← Previous
                  </button>

                  <div className="bg-black/50 rounded-[56px] px-6 py-2 text-sm text-white/60 font-mono">
                    Page <span className="text-white font-semibold">{currentPage}</span>
                    {' '}of{' '}
                    <span className="text-white font-semibold">{totalPages}</span>
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-5 py-2 rounded-[56px] text-white text-sm font-medium
                               outline outline-white/20 hover:outline-blue-400 hover:text-blue-400
                               disabled:opacity-30 disabled:cursor-not-allowed
                               transition duration-200"
                  >
                    Next →
                  </button>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
      <InvoiceChatWidget />
    </div>
  );
};

export default TransactionPage;