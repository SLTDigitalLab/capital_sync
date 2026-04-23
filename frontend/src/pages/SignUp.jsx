import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../firebase";

import FirstName from '../assets/component/FirstName';
import LastName from '../assets/component/LastName';
import SignUpEmail from '../assets/component/SignUpEmail';
import SignUpPassword from '../assets/component/SignUpPassword';

const SignUp = () => {

  const [addFirstName, setAddFirstName] = useState('');
  const [addLastName, setAddLastName] = useState('');
  const [email, setEmail] = useState('');
  const [addPassword, setAddPassword] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

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
    <main>
      <div className='items-center justify-center'>
        <h1 className='pt-5 font-light'>Sign Up</h1>
        <p className='text-center text-white pt-2 text-sm'>
          Create an Account to track your wealth
        </p>

        <div className='flex justify-center mt-5'>
          <div className='w-[430px] bg-dark-100 rounded-md p-8 shadow-lg bg-opacity-30'>

            <span className='text-white'>First Name *</span>
            <FirstName addFirstName={addFirstName} setAddFirstName={setAddFirstName} />

            <span className='text-white'>Last Name</span>
            <LastName addLastName={addLastName} setAddLastName={setAddLastName} />

            <span className='text-white'>Email *</span>
            <SignUpEmail email={email} setEmail={setEmail} />

            <span className='text-white'>Password *</span>
            <SignUpPassword addPassword={addPassword} setAddPassword={setAddPassword} />

            {error && (
              <p className='text-red-500 text-sm mt-2'>{error}</p>
            )}

            <button
              onClick={handleSignUp}
              className='w-full bg-light-100/10 py-3 mt-6 rounded-lg text-white hover:bg-light-100/20 transition'
            >
              Create Account
            </button>

          </div>
        </div>
      </div>
    </main>
  );
};

export default SignUp;
