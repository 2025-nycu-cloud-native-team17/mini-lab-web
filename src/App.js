import React from 'react';
import { Route, Routes } from "react-router-dom";
import MemberManagement from './pages/MemberManagement';
import MachineManagement from './pages/MachineManagement';
import TaskManagement from './pages/TaskManagement';
import LoginPage from './pages/Login';
import Home from './pages/Home';


function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/member" element={<MemberManagement />} />
            <Route path="/machine" element={<MachineManagement />} />
            <Route path="/task" element={<TaskManagement />} />
        </Routes>

    );
}

export default App;
