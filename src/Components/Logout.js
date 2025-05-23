import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Logout() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();           // 清除登入狀態
        navigate('/login'); // 導回登入頁
    };

    return (
        <div className="flex justify-end">

            <button
                onClick={handleLogout}
                className="bg-red-500 text-white w-24 h-12 rounded shadow hover:bg-red-600 z-50"
            >
                Logout
            </button>
        </div>

    );
}

export default Logout;
