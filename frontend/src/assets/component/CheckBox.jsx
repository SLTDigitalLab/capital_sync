import React from 'react'
import { Link } from 'react-router-dom'

const CheckBox = ({isChecked,setIsChecked}) => {
  return (
    <label className="flex items-center gap-2 mr-2 mt-5 text-white ">
      <input
        type="checkbox"
        checked={isChecked}
        onChange={(e) => setIsChecked(e.target.checked)} 
      />
      <div className='flex items-center justify-between gap-27 '>
        <span className='text-sm'>Remenber Me</span>
        <Link className='text-sm'>Forgot Password</Link>
      </div>
    </label>
    
  )
}

export default CheckBox