import React from 'react';

const SignUpButton = ({ handleSignUp }) => {
  return (
    <div
      className='search mt-5 cursor-pointer bg-green-600 hover:bg-green-700 text-white py-2 rounded-md'
      onClick={handleSignUp}
    >
      <h3 className='text-center'>Create Account</h3>
    </div>
  );
}

export default SignUpButton;
