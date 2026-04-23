import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from "react-router-dom";
import { signInWithEmailFunc, signInWithGoogle, signInWithGithub } from '../firebase';
import bgImage from '../assets/bg-image.jpg'
import { setSessionTimestamp } from '../utils/authUtils';

//SignUp
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../firebase";

const Loginpage = () => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
  }, []);
  const [emailAddress, setEmailAddress] = useState('');
  const [passWord, setPassWord] = useState('');
  const [isChecked, setIsChecked] = useState(false);

  const [isSignup, setIsSignup] = useState(false)

  //Signup
  const [addFirstName, setAddFirstName] = useState('');
  const [addLastName, setAddLastName] = useState('');
  const [email, setEmail] = useState('');
  const [addPassword, setAddPassword] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();



  // Email/password login
  const handleEmailSignIn = async () => {
    try {
      const userCredential = await signInWithEmailFunc(emailAddress, passWord);
      console.log("Signed in user:", userCredential.user);
      setSessionTimestamp();
      navigate("/home-page"); // go to home page
    } catch (error) {
      console.error("Login error:", error.message);
      alert(error.message); // show error to user
    }
  };

  //SIgnUP
  const handleSignUp = async () => {
    setError('');

    // ✅ Mandatory field check
    if (!addFirstName || !email || !addPassword) {
      setError("First Name, Email and Password are required");
      return;
    }

    try {
      // 🔥 Create user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        addPassword
      );

      // 🔥 Save First Name in Firebase profile
      await updateProfile(userCredential.user, {
        displayName: `${addFirstName} ${addLastName}`
      });

      console.log("User created:", userCredential.user);

      // ✅ Navigate after signup
      navigate("/login");

    } catch (err) {
      setError(err.message);
    }
  };



  return (
    <>
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animated-element {
          opacity: 0;
          transform: translateY(-40px);
        }

        .slide-down {
          animation: slideDown 0.7s ease-out forwards;
        }

        .slide-delay-1 { animation-delay: 0.1s; }
        .slide-delay-2 { animation-delay: 0.2s; }
        .slide-delay-3 { animation-delay: 0.3s; }
        .slide-delay-4 { animation-delay: 0.4s; }
        .slide-delay-5 { animation-delay: 0.5s; }
        .slide-delay-6 { animation-delay: 0.6s; }
      `}</style>
      <div
        className='h-screen bg-cover bg-center overflow-hidden'
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="absolute inset-0 bg-black/50">
          <div className='flex items-center justify-center h-screen'>
            <div>
              <div className='h-180 bg-white rounded-[60px] relative overflow-hidden'>

                {/* 🔵 BLUE SLIDING CONTAINER */}
                <div
                  className={`absolute top-0 h-full w-1/2 bg-[#000325] bg-cover flex items-center justify-center transition-all duration-700 ${isSignup
                    ? "left-0 rounded-l-[56px]"
                    : "left-1/2 rounded-r-[56px]"
                    }`}
                >
                  <div className='text-center px-10'>
                    {isSignup ? (
                      <>
                        <h1 className={`animated-element text-white font-bold text-6xl ${animate && 'slide-down slide-delay-1'}`} style={{ fontSize: '50px' }}>Hello, Friend!</h1>
                        <p className={`animated-element text-white text-sm ${animate && 'slide-down slide-delay-2'}`} style={{ fontSize: '12px' }}>
                          Enter your personal details and start your journey with us
                        </p>
                        <div className='flex justify-center mt-3'>
                          <div>
                            <p className={`animated-element text-white text-sm mb-2 ${animate && 'slide-down slide-delay-3'}`} style={{ fontSize: '12px' }}>
                              Already have an account?
                            </p>
                            <button
                              onClick={() => setIsSignup(false)}
                              className={`animated-element border text-white border-white px-6 py-3 cursor-pointer rounded-[60px] font-bold hover:bg-white hover:text-black transition duration-300 ${animate && 'slide-down slide-delay-4'}`}
                            >
                              Sign In
                            </button>
                          </div>

                        </div>
                      </>
                    ) : (
                      <>
                        <h1 className={`animated-element text-white font-bold text-6xl ${animate && 'slide-down slide-delay-1'}`} style={{ fontSize: '50px' }}>Welcome Back</h1>
                        <p className={`animated-element text-white text-sm ${animate && 'slide-down slide-delay-2'}`} style={{ fontSize: '12px' }}>
                          To keep connected with us please login with your personal info
                        </p>
                        <div className='flex justify-center mt-3'>
                          <div>
                            <p className={`animated-element text-white text-sm mb-2 ${animate && 'slide-down slide-delay-3'}`} style={{ fontSize: '12px' }}>
                              Don't have an account?
                            </p>
                            <button
                              onClick={() => setIsSignup(true)}
                              className={`animated-element border text-white border-white px-6 py-3 cursor-pointer rounded-[60px] font-bold hover:bg-white hover:text-black transition duration-300 ${animate && 'slide-down slide-delay-4'}`}
                            >
                              Sign Up
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* ⚪ WHITE CONTENT AREA */}
                <div className='flex h-full'>

                  {/* LOGIN FORM */}
                  <div
                    className={`w-1/2 px-30 py-20 flex flex-col justify-center transition-all duration-700 ${isSignup
                      ? "-translate-x-full opacity-0"
                      : "translate-x-0 opacity-100 items-start text-left"
                      }`}
                  >
                    <h1 className={`animated-element text-left text-black font-bold text-6xl mb-12 ${animate && 'slide-down slide-delay-1'}`} style={{ fontSize: '50px' }}>Log In</h1>

                    <span className={`animated-element text-black text-xl ${animate && 'slide-down slide-delay-2'}`} style={{ fontSize: '16px' }}>Email Address</span>
                    <input
                      type='email'
                      placeholder='example@gmail.com'
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      className={`animated-element my-2 w-full px-5 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${animate && 'slide-down slide-delay-2'}`}
                    />

                    <span className={`animated-element text-black text-xl mt-4 ${animate && 'slide-down slide-delay-3'}`} style={{ fontSize: '16px' }}>Password</span>
                    <input
                      type='password'
                      placeholder='password'
                      value={passWord}
                      onChange={(e) => setPassWord(e.target.value)}
                      className={`animated-element mt-2 w-full px-5 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${animate && 'slide-down slide-delay-3'}`}
                    />

                    <div className='flex justify-center w-full'>
                      <button className={`animated-element mt-10 border border-blue-500 px-6 py-3 cursor-pointer rounded-[60px] font-bold hover:bg-blue-600 hover:scale-105 hover:text-white transition duration-300 active:bg-blue-800 ${animate && 'slide-down slide-delay-4'}`}
                        onClick={handleEmailSignIn}>
                        Sign In
                      </button>
                    </div>
                  </div>

                  {/* SIGNUP FORM */}
                  <div
                    className={`w-1/2 px-30 py-20 flex flex-col justify-center transition-all duration-700 ${isSignup
                      ? "translate-x-0 opacity-100 items-start text-left"
                      : "translate-x-full opacity-0"
                      }`}
                  >
                    <h1 className={`animated-element text-left text-black font-bold text-6xl mb-6 ${animate && 'slide-down slide-delay-1'}`} style={{ fontSize: '50px' }}>Create Account</h1>

                    <span className={`animated-element text-black text-xl ${animate && 'slide-down slide-delay-2'}`} style={{ fontSize: '16px' }}>First Name</span>
                    <input
                      type='text'
                      placeholder='John'
                      value={addFirstName}
                      onChange={(e) => setAddFirstName(e.target.value)}
                      className={`animated-element my-2 w-full px-5 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${animate && 'slide-down slide-delay-2'}`}
                    />

                    <span className={`animated-element text-black text-xl mt-2 ${animate && 'slide-down slide-delay-3'}`} style={{ fontSize: '16px' }}>Last Name</span>
                    <input
                      type='text'
                      placeholder='Doe'
                      value={addLastName}
                      onChange={(e) => setAddLastName(e.target.value)}
                      className={`animated-element my-2 w-full px-5 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${animate && 'slide-down slide-delay-3'}`}
                    />

                    <span className={`animated-element text-black text-xl mt-2 ${animate && 'slide-down slide-delay-4'}`} style={{ fontSize: '16px' }}>Email Address</span>
                    <input
                      type='email'
                      placeholder='example@gmail.com'
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`animated-element my-2 w-full px-5 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${animate && 'slide-down slide-delay-4'}`}
                    />

                    <span className={`animated-element text-black text-xl mt-2 ${animate && 'slide-down slide-delay-5'}`} style={{ fontSize: '16px' }}>Password</span>
                    <input
                      type='password'
                      placeholder='password'
                      value={addPassword}
                      onChange={(e) => setAddPassword(e.target.value)}
                      className={`animated-element mt-2 w-full px-5 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${animate && 'slide-down slide-delay-5'}`}
                    />
                    {error && (
                      <p className={`animated-element text-red-500 text-sm mt-2 ${animate && 'slide-down slide-delay-6'}`} style={{ fontSize: '12px' }}>{error}</p>
                    )}

                    <div className='flex justify-center w-full'>
                      <button className={`animated-element mt-10 border border-blue-500 px-6 py-3 cursor-pointer rounded-[60px] font-bold hover:bg-blue-600 hover:scale-105 transition duration-300 active:bg-blue-800 ${animate && 'slide-down slide-delay-6'}`}
                        onClick={handleSignUp}>
                        Sign Up
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Loginpage;
