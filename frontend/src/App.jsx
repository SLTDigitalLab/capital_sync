import React from 'react'
import { Routes, Route } from "react-router-dom";
import Starting from './pages/Starting';
import Loginpage from './pages/Loginpage';
import Home from './pages/Home';
import IncomePage from './pages/IncomePage';
import SignUp from './pages/SignUp';
import Aboutus from './pages/Aboutus';
import Analytics from './pages/Analytics';
import ExpensesPage from './pages/ExpensesPage';
import TransactionPage from './pages/TransactionPage';
import { useEffect, useState } from 'react';


const App = () => {

  const [data, setData] = useState(null);
  const API = import.meta.env.VITE_API_URL || '';

  useEffect(() => {
    const url = API ? `${API}/` : '/api/';
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((result) => setData(result))
      .catch((err) => console.error('Failed to load root:', err));
  }, [API]);
  
  return (
    <Routes>
      <Route path="/" element={<Starting />} />
      <Route path="/login" element={<Loginpage />} />
      <Route path="/home-page" element={<Home/>} />
      <Route path="/income-page" element={<IncomePage/>} />
      <Route path="/sign-up" element={<SignUp/>} />
      <Route path="/about-us" element={<Aboutus/>} />
      <Route path="/analytics" element={<Analytics/>} />
      <Route path="/expenses-page" element={<ExpensesPage/>} />
      <Route path="/transaction-page" element={<TransactionPage/>} />
      
    </Routes>
  );
}

export default App