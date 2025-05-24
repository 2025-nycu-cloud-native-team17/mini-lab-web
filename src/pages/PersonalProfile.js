import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../utils/api';
import Header from '../Components/Header';
import { useAuth } from '../contexts/AuthContext';
import Logout from '../Components/Logout';


function PersonalProfile() {
    const { authFetch } = useApi();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const { logout } = useAuth();


    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await authFetch("user");
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                const userData = await res.json();
                setUser(userData);
            } catch (err) {
                console.error("Failed to load user:", err);
                navigate('/login');
            }
        };
        fetchUser();
    }, [authFetch, navigate]);

    return (
        <div>
            <Header />
            <Logout />
            <div className="flex h-[calc(100vh-60px)] overflow-hidden">
                {/* 左邊：用戶資料 */}
                <div className="w-1/2 p-6 overflow-auto border-r">
                    <h2 className="text-xl font-bold mb-4">User Info</h2>
                    {user ? (
                        <table className="table-auto border-collapse w-full">
                            <tbody>
                                <tr><td className="font-bold pr-2">Name:</td><td>{user.name}</td></tr>
                                <tr><td className="font-bold pr-2">Email:</td><td>{user.email}</td></tr>
                                <tr><td className="font-bold pr-2">Role:</td><td>{user.role}</td></tr>
                                <tr><td className="font-bold pr-2">Test Type:</td><td>{user.testType}</td></tr>
                                <tr><td className="font-bold pr-2">Status:</td><td>{user.status}</td></tr>
                            </tbody>
                        </table>
                    ) : (
                        <p>Loading...</p>
                    )}
                </div>

                {/* 右邊：時間軸與待辦事項 */}
                <div className="w-1/2 p-6 overflow-y-auto">
                    <h2 className="text-xl font-bold mb-4">Today's Timeline</h2>
                    <div className="space-y-4">
                        {[
                            { time: "09:00", task: "Check emails" },
                            { time: "10:00", task: "Team stand-up meeting" },
                            { time: "11:00", task: "Work on report" },
                            { time: "13:00", task: "Lunch break" },
                            { time: "14:00", task: "Client call" },
                            { time: "15:30", task: "Review PRs" },
                            { time: "17:00", task: "Plan for tomorrow" },
                        ].map((item, index) => (
                            <div key={index} className="flex items-start gap-4">
                                <div className="w-20 text-right font-mono">{item.time}</div>
                                <div className="flex-1 bg-gray-100 p-3 rounded-md shadow-sm">{item.task}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PersonalProfile;
