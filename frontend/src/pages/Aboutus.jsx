import React, { useState, useEffect } from 'react'
import DashBar from '../assets/component/DashBar'

const Aboutus = () => {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setLoaded(true)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-l from-[#016394] to-[#6845FB] bg-cover bg-center bg-fixed font-sans">
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-slide-up { animation: fadeSlideUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
        .stagger-1 { animation-delay: 0.1s; opacity: 0; }
        .stagger-2 { animation-delay: 0.2s; opacity: 0; }
        .stagger-3 { animation-delay: 0.3s; opacity: 0; }
        .stagger-4 { animation-delay: 0.4s; opacity: 0; }
      `}</style>

      {/* Dim overlay matching other pages */}
      <div className="fixed inset-0 bg-black/50 pointer-events-none" />

      <div className={`relative transition-opacity duration-700 ${loaded ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* NAV */}
        <div className='w-full flex justify-center pt-8'>
          <div className="w-full fade-slide-up stagger-1">
            <DashBar/>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex justify-center px-4 sm:px-6 lg:px-8 mt-16 sm:mt-24 pb-20">
          <div className="w-full max-w-5xl flex flex-col items-center text-center">
            
            {/* Header Section */}
            <div className="fade-slide-up stagger-2 max-w-3xl">
              <h1 className="text-white text-5xl sm:text-6xl md:text-7xl font-black tracking-tighter leading-tight mb-6">
                Master Your Finances with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-[#8080FF]">Capital Sync</span>
              </h1>
              <p className="text-white/70 text-lg sm:text-xl font-medium leading-relaxed mb-12">
                We believe tracking your wealth shouldn't feel like a chore. <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-[#8080FF] font-bold">Capital Sync</span> combines beautiful design, real-time analytics, and cutting-edge artificial intelligence to give you absolute clarity over your financial future.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full fade-slide-up stagger-3">
              
              {/* Card 1 */}
              <div className="bg-black/40 backdrop-blur-md rounded-3xl p-8 border border-white/10 hover:bg-black/50 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#8080FF]/20">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#8080FF]/30 to-[#8080FF]/10 flex items-center justify-center mb-6 mx-auto md:mx-0">
                  <svg className="w-7 h-7 text-[#8080FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-white text-2xl font-bold mb-3 md:text-left text-center">Real-Time Sync</h3>
                <p className="text-white/50 leading-relaxed md:text-left text-center">
                  Your dashboard updates instantly. Whether you add an expense manually or via chat, your balances and charts reflect the changes immediately without refreshing.
                </p>
              </div>

              {/* Card 2 */}
              <div className="bg-black/40 backdrop-blur-md rounded-3xl p-8 border border-white/10 hover:bg-black/50 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-500/20">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/30 to-emerald-500/10 flex items-center justify-center mb-6 mx-auto md:mx-0">
                  <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-white text-2xl font-bold mb-3 md:text-left text-center">AI Invoice Chat</h3>
                <p className="text-white/50 leading-relaxed md:text-left text-center">
                  Upload receipts or simply type "I spent $50 on groceries". Our embedded AI assistant automatically parses your inputs and categorizes your transactions seamlessly.
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-black/40 backdrop-blur-md rounded-3xl p-8 border border-white/10 hover:bg-black/50 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-400/20">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400/30 to-blue-400/10 flex items-center justify-center mb-6 mx-auto md:mx-0">
                  <svg className="w-7 h-7 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-white text-2xl font-bold mb-3 md:text-left text-center">Mobile Perfect</h3>
                <p className="text-white/50 leading-relaxed md:text-left text-center">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-[#8080FF] font-semibold">Capital Sync</span> goes wherever you go. Enjoy a fully responsive, app-like experience on your smartphone, tablet, or desktop.
                </p>
              </div>

            </div>

            {/* Footer / Contact */}
            <div className="mt-20 fade-slide-up stagger-4 flex flex-col items-center">
              <div className="h-px w-24 bg-gradient-to-r from-transparent via-white/20 to-transparent mb-8" />
              <p className="text-white/40 text-sm font-mono tracking-widest uppercase">
                Designed for the modern wealth builder
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default Aboutus