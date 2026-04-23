import React from 'react'

const ExpenseTitle = ({title,setTitle}) => {
  return (
    <div className='search mt-2 mb-3 border rounded-xl border-slate-700 hover:border-indigo-500 transition'>
        <div>
            <input type='text' 
            placeholder='add title' 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} className='text-sm'/>
        </div>
    </div>
  )
}

export default ExpenseTitle