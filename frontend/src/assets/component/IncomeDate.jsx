import React from 'react'

const Date = ({date, setDate}) => {
  return (
    <div className='search mt-2'>
        <div>
            <input type='date' 
            placeholder='20xx/xx/xx' 
            value={date} 
            onChange={(e) => setDate(e.target.value)}/>
        </div>
    </div>
  )
}

export default Date