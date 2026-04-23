import React from 'react'
import { useNavigate } from "react-router-dom";

const GoogleSignin = ({text}) => {

  const navigate = useNavigate();
  return (
    <div className='w-full bg-light-100/5 px-2 py-2 rounded-lg mt-5 max-w-3xl mx-auto'>
        <h3 className='text-white text-center ml-10 mr-10'>{text}</h3>
    </div>
  )
}

export default GoogleSignin