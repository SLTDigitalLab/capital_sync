import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";

const DashBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = getAuth();

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
    <div className="flex items-center justify-between gap-60 text-white">
      <p className="font-bold text-2xl text-[#8080FF]">Capital Sync</p>

      <div className="flex justify-between gap-5">
        {navItems.map(({ label, path }) => (
          <p
            key={label}
            onClick={() => navigate(path)}
            className={`flex justify-center items-center hover:cursor-pointer w-[120px] h-[35px] text-center font-bold hover:text-[#8080FF] transition duration-300
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

      <button
        onClick={handleLogout}
        className="ml-4 px-4 py-2 bg-[#8080FF] text-white font-bold rounded-3xl hover:bg-[#6060DD] transition"
      >
        Log Out
      </button>
    </div>
  );
};

export default DashBar;