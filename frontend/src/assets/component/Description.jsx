import React from 'react'

const Description = ({addDescription,setAddDescription}) => {
  return (
    <div className='search mt-2 mb-3 border rounded-xl border-slate-700 hover:border-indigo-500 transition'>
        <div>
            <input type='text' 
            placeholder='Add Description' 
            value={addDescription} 
            onChange={(e) => setAddDescription(e.target.value)} className='text-sm'/>
        </div>
    </div>
  )
}

export default Description