import React from 'react'

const PassWord = ({PassWord,setPassWord}) => {
  return (
    <div className='search mt-2'>
        <div>
            <input type='password' 
            placeholder='Enter your Password' 
            value={PassWord} 
            onChange={(e) => setPassWord(e.target.value)} className='text-sm'/>
        </div>
    </div>
  )
}

export default PassWord