import React from 'react';

const SignIn = ({ handleSignIn }) => {
  return (
    <div
      className='search mt-5 cursor-pointer bg-gray-100 border hover:bg-blue-700 text-white py-2 rounded-md'
      onClick={handleSignIn}  // <-- triggers sign-in
    >
      <h3 className='text-center'>Sign in</h3>
    </div>
  )
}

export default SignIn;
