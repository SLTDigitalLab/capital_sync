import React from 'react'

const SignUpPassword = ({addPassword,setAddPassword}) => {
  return (
    <div className='w-full bg-light-100/5 px-2 py-3 text-sm mb-2 rounded-lg mt-1 max-w-3xl mx-auto '>
        <div>
            <input 
            type='password' 
            placeholder='Enter your Password' 
            value={addPassword} 
            onChange={(e) => setAddPassword(e.target.value)} className='w-full bg-transparent  sm:pr-2 pl-2  text-gray-200 placeholder-light-200 outline-hidden'/>
        </div>
    </div>
  )
}

export default SignUpPassword