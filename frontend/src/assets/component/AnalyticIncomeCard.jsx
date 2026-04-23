import React from 'react'

const AnalyticIncomeCard = () => {
  return (
    <div><div>
                    <div className='py-1 sm:py-2 md:py-2 text-white text-xs sm:text-sm'><span>Salary</span></div>
                    <div className='py-1 sm:py-2 md:py-2 text-white text-xs sm:text-sm'><span>Freelance</span></div>
                    <div className='py-1 sm:py-2 md:py-2 text-white text-xs sm:text-sm'><span>Business Income</span></div>
                    <div className='py-1 sm:py-2 md:py-2 text-white text-xs sm:text-sm'><span>Investment</span></div>
                    <div className='py-1 sm:py-2 md:py-2 text-white text-xs sm:text-sm'><span>Others</span></div>
                  </div>
                  <div>
                    <div className='py-1 sm:py-2 md:py-2 text-white text-xs sm:text-sm'><span>Rs {formatCurrency(totalSalary)}</span></div>
                    <div className='py-1 sm:py-2 md:py-2 text-white text-xs sm:text-sm'><span>Rs {formatCurrency(totalFreelance)}</span></div>
                    <div className='py-1 sm:py-2 md:py-2 text-white text-xs sm:text-sm'><span>Rs {formatCurrency(totalBusinessIncome)}</span></div>
                    <div className='py-1 sm:py-2 md:py-2 text-white text-xs sm:text-sm'><span>Rs {formatCurrency(totalInvestment)}</span></div>
                    <div className='py-1 sm:py-2 md:py-2 text-white text-xs sm:text-sm'><span>Rs {formatCurrency(totalOthers)}</span></div>
                  </div></div>
  )
}

export default AnalyticIncomeCard