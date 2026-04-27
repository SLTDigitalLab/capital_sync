import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";

const DashBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = getAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error.message);
    }
  };

  const navItems = [
    { label: "Dashboard", path: "/home-page" },
    { label: "Income", path: "/income-page" },
    { label: "Expenses", path: "/expenses-page" },
    { label: "Transaction", path: "/transaction-page" },
    { label: "Analytics", path: "/analytics" },
    { label: "About Us", path: "/about-us" },
  ];

  return (
    <div className="w-full relative z-50">
      {/* Main Bar */}
      <div className="flex items-center justify-between px-6 md:px-10 lg:gap-20 xl:gap-60 text-white w-full">
        <p className="font-bold text-xl md:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-[#8080FF] whitespace-nowrap">Capital Sync</p>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex justify-between gap-2 xl:gap-5 flex-1 max-w-4xl">
          {navItems.map(({ label, path }) => (
            <p
              key={label}
              onClick={() => navigate(path)}
              className={`flex justify-center items-center hover:cursor-pointer px-4 h-[35px] text-center font-bold hover:text-[#8080FF] transition duration-300 text-sm xl:text-base whitespace-nowrap
                ${
                  isActive(path)
                    ? "text-[#8080FF] outline outline-2 outline-[#8080FF] rounded-[56px]"
                    : "text-white"
                }`}
            >
              {label}
            </p>
          ))}
        </div>

        {/* Desktop Logout Button */}
        <button
          onClick={handleLogout}
          className="hidden lg:block ml-4 px-4 py-2 bg-[#8080FF] text-white font-bold rounded-3xl hover:bg-[#6060DD] transition whitespace-nowrap"
        >
          Log Out
        </button>

        {/* Mobile Hamburger Icon */}
        <button
          className="lg:hidden text-white p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-gray-900/95 backdrop-blur-md shadow-lg border border-gray-800 rounded-2xl mt-4 mx-4 md:mx-10 flex flex-col py-4 px-6 gap-4 relative z-50">
          {navItems.map(({ label, path }) => (
            <p
              key={label}
              onClick={() => {
                navigate(path);
                setIsMobileMenuOpen(false);
              }}
              className={`text-lg font-bold hover:text-[#8080FF] transition duration-300 py-2
                ${isActive(path) ? "text-[#8080FF]" : "text-white"}`}
            >
              {label}
            </p>
          ))}
          <div className="h-px w-full bg-gray-700 my-2"></div>
          <button
            onClick={() => {
              handleLogout();
              setIsMobileMenuOpen(false);
            }}
            className="w-full py-3 bg-[#8080FF] text-white font-bold rounded-xl hover:bg-[#6060DD] transition text-lg text-center"
          >
            Log Out
          </button>
        </div>
      )}
    </div>
  );
};

export default DashBar;