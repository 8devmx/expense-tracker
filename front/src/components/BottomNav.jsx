import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaChartLine, FaExchangeAlt, FaTags, FaCog } from 'react-icons/fa';

const BottomNav = () => {
  return (
    <nav className="bottom-nav-glass">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-around h-14">
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => `
              flex flex-col items-center justify-center flex-1 h-full
              transition-all duration-200 rounded-xl
              ${isActive 
                ? 'text-[#e17055]' 
                : 'text-[#6b7280] hover:text-[#e17055] hover:bg-[#fde8e4]/50'}
            `}
          >
            {({ isActive }) => (
              <>
                <div className={`relative ${isActive ? 'text-[#e17055]' : ''}`}>
                  <FaChartLine className="w-6 h-6" />
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#e17055]"></span>
                  )}
                </div>
                <span className={`text-xs mt-1 font-medium ${isActive ? 'text-[#e17055]' : ''}`}>
                  Dashboard
                </span>
              </>
            )}
          </NavLink>

          <NavLink 
            to="/transactions" 
            className={({ isActive }) => `
              flex flex-col items-center justify-center flex-1 h-full
              transition-all duration-200 rounded-xl
              ${isActive 
                ? 'text-[#e17055]' 
                : 'text-[#6b7280] hover:text-[#e17055] hover:bg-[#fde8e4]/50'}
            `}
          >
            {({ isActive }) => (
              <>
                <div className={`relative ${isActive ? 'text-[#e17055]' : ''}`}>
                  <FaExchangeAlt className="w-6 h-6" />
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#e17055]"></span>
                  )}
                </div>
                <span className={`text-xs mt-1 font-medium ${isActive ? 'text-[#e17055]' : ''}`}>
                  Transacciones
                </span>
              </>
            )}
          </NavLink>

          <NavLink 
            to="/categories" 
            className={({ isActive }) => `
              flex flex-col items-center justify-center flex-1 h-full
              transition-all duration-200 rounded-xl
              ${isActive 
                ? 'text-[#e17055]' 
                : 'text-[#6b7280] hover:text-[#e17055] hover:bg-[#fde8e4]/50'}
            `}
          >
            {({ isActive }) => (
              <>
                <div className={`relative ${isActive ? 'text-[#e17055]' : ''}`}>
                  <FaTags className="w-6 h-6" />
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#e17055]"></span>
                  )}
                </div>
                <span className={`text-xs mt-1 font-medium ${isActive ? 'text-[#e17055]' : ''}`}>
                  Categorías
                </span>
              </>
            )}
          </NavLink>

          <NavLink 
            to="/settings" 
            className={({ isActive }) => `
              flex flex-col items-center justify-center flex-1 h-full
              transition-all duration-200 rounded-xl
              ${isActive 
                ? 'text-[#e17055]' 
                : 'text-[#6b7280] hover:text-[#e17055] hover:bg-[#fde8e4]/50'}
            `}
          >
            {({ isActive }) => (
              <>
                <div className={`relative ${isActive ? 'text-[#e17055]' : ''}`}>
                  <FaCog className="w-6 h-6" />
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#e17055]"></span>
                  )}
                </div>
                <span className={`text-xs mt-1 font-medium ${isActive ? 'text-[#e17055]' : ''}`}>
                  Ajustes
                </span>
              </>
            )}
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
