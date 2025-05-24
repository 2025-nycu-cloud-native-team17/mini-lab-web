import React, { useState } from 'react';
import { Link } from "react-router-dom";
import menu from '../Icons/menu.png'
import profile from '../Icons/profile.png'
import member from '../Icons/member.png'
import machine from '../Icons/machine.png'
import task from '../Icons/task.png'
import { useAuth } from '../contexts/AuthContext';

function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { accessToken } = useAuth();
    const isLoggedIn = !!accessToken;

    const toggleMenu = () => {
        setIsMenuOpen((prev) => !prev);
    };

    return (
        <>
            <header className="flex bg-white border-black border-b-4 text-2xl h-24 items-center relative z-20">
                <img
                    src={menu}
                    alt="menu"
                    className="w-12 h-12 mx-6 cursor-pointer"
                    onClick={toggleMenu}
                />
                <div>Mini Lab</div>
                {isLoggedIn ? (
                    <Link to="/profile" className="ml-auto mx-6">
                        <img src={profile} alt="profile" className="w-12 h-12 cursor-pointer" />
                    </Link>
                ) : (
                    <Link to="/login" className="ml-auto mx-6">
                        <img src={profile} alt="profile" className="w-12 h-12 cursor-pointer" />
                    </Link>
                )}
            </header>

            {/* Sidebar 選單 */}
            <div
                className={`fixed top-0 left-0 h-full w-64 bg-white shadow-md transform transition-transform duration-300 z-10 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="h-24 flex items-center px-6 font-bold text-xl border-b border-gray-200">
                    功能列表
                </div>
                <ul className="flex flex-col items-center px-6 py-4 space-y-4 text-xl">
                    <li>
                        <Link to="/member" className="flex items-center justify-between w-full px-4 py-2 hover:bg-gray-100 rounded" onClick={toggleMenu}>
                            <img src={member} alt="member" className="w-10 h-10" />
                            <span className="text-lg ml-4">Member</span>
                        </Link>
                    </li>
                    <li>
                        <Link to="/machine" className="flex items-center justify-between w-full px-4 py-2 hover:bg-gray-100 rounded" onClick={toggleMenu}>
                            <img src={machine} alt="machine" className="w-10 h-10" />
                            <span className="text-lg ml-4">Machine</span>
                        </Link>
                    </li>
                    <li>
                        <Link to="/task" className="flex items-center justify-between w-full px-4 py-2 hover:bg-gray-100 rounded" onClick={toggleMenu}>
                            <img src={task} alt="task" className="w-10 h-10" />
                            <span className="text-lg ml-4">Test Task</span>
                        </Link>
                    </li>
                </ul>
            </div>

            {/* 背景遮罩 */}
            {isMenuOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-30 z-0"
                    onClick={toggleMenu}
                />
            )}
        </>
    );
}

export default Header;
