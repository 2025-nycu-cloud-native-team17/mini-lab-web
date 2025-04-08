import React from 'react';
import { Link } from "react-router-dom";
import Header from '../Components/Header.js'


function Home() {
    return (
        <div>
            <Header />
            <div className="p-8 space-y-4">
                <h1 className="text-2xl font-bold mb-4">首頁連結</h1>
                <ul className="space-y-2">
                    <li>
                        <Link to="/login" className="text-blue-600 hover:underline">登入頁</Link>
                    </li>
                    <li>
                        <Link to="/member" className="text-blue-600 hover:underline">會員管理</Link>
                    </li>
                    <li>
                        <Link to="/machine" className="text-blue-600 hover:underline">設備管理</Link>
                    </li>
                    <li>
                        <Link to="/task" className="text-blue-600 hover:underline">任務管理</Link>
                    </li>
                </ul>
            </div>
        </div>
    );
}

export default Home