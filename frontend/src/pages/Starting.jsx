import React from 'react'
import GetStarted from '../assets/component/GetStarted'
import { useNavigate } from "react-router-dom";
import bgImage from '../assets/bd-image1.jpg'
import { useEffect, useState } from "react";


const Starting = () => {

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Trigger animation on mount
    setIsLoaded(true);
  }, []);

  const navigate = useNavigate();
  
  return (
    <div className='h-screen bg-cover bg-center'
      style={{backgroundImage: `url(${bgImage})`}}>
        <div className="absolute inset-0 bg-gradient-to-l from-black/50 to-black/80">
          <div className='flex items-center h-screen ml-40'>
          <div  className={`flex justify-center px-3 overflow-hidden transition-transform transition-opacity duration-1200 ease-out 
    ${isLoaded ? "translate-x-[0%] opacity-100" : "-translate-x-full opacity-0"}`}>
              <div>
                <div>
                  <h1 className='text-blue-500 font-bold text-8xl'>Capital Sync</h1>
                </div>
                <div className='py-8 pr-8'>
                  <div>
                    <span className='text-white text-xl'>Your gateway to financial success Start here.</span>
                  </div>
                  <div>
                    <span className='text-white text-xl'>Join us to manage  and grow your wealth effectively</span>
                  </div>
                  <div onClick={() => navigate("/login")}>
                    <GetStarted/>
                  </div>
                </div>
              </div>
              
          </div>
        </div>
        </div>

    </div>
  )
}

export default Starting