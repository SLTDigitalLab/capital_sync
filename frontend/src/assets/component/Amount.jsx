import React from 'react'

const Amount = ({incomeAmount,setIncomeAmount}) => {
  return (
    <div className='search mt-2 mb-3 border rounded-xl border-slate-700 hover:border-indigo-500 transition'>
        <div>
            <input type='text' 
            placeholder='Add amount' 
            value={incomeAmount} 
            onChange={(e) => setIncomeAmount(e.target.value)} className='text-sm'/>
        </div>
    </div>
  )
}

export default Amount