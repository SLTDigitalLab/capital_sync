import React from 'react'

const AddIncomeButton = ({handleAddIncome}) => {
  return (
    <div className='bg-light-200 py-3.5 rounded-2xl cursor-pointer shadow-inner shadow-light-100/10 w-45 h-14 m-5 text-gray-100 text-lg text-center transition-all duration-300 
                    hover:shadow-xl hover:scale-101' onClick={handleAddIncome}><span className='bg-light-200 py-3.5 rounded-2xl cursor-pointer shadow-inner shadow-light-100/10 w-45 h-14 m-5 text-gray-100 text-lg text-center transition-all duration-300 
                    hover:shadow-xl hover:scale-101'>Add Income</span></div>
  )
}

export default AddIncomeButton