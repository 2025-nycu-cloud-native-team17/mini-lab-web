import React from 'react';
import { Route, Routes } from "react-router-dom";
import MemberManagement from './pages/MemberManagement';
import MachineManagement from './pages/MachineManagement';
import TaskManagement from './pages/TaskManagement';
import LoginPage from './pages/Login';
import Modification from './pages/Modification'
import PersonalProfile from './pages/PersonalProfile';


function App() {
    return (
        <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/member" element={<MemberManagement />} />
            <Route path="/machine" element={<MachineManagement />} />
            <Route path="/task" element={<TaskManagement />} />
            <Route path="/:dataType/:id" element={<Modification />} />
            <Route path="/profile" element={<PersonalProfile />} />
        </Routes>

    );
}

export default App;
