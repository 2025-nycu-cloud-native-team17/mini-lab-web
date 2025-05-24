import React from 'react';
import { Route, Routes } from "react-router-dom";
import MemberManagement from './pages/MemberManagement';
import MachineManagement from './pages/MachineManagement';
import TaskManagement from './pages/TaskManagement';
import LoginPage from './pages/Login';
import Home from './pages/Home';
import Modification from './pages/Modification'
import PersonalInfo from './pages/PersonalInfo'


function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/member" element={<MemberManagement />} />
            <Route path="/machine" element={<MachineManagement />} />
            <Route path="/task" element={<TaskManagement />} />
            <Route path="/PersonalInfo/:id" element={<PersonalInfo />} />
            <Route path="/:dataType/:id" element={<Modification />} />
        </Routes>

    );
}

export default App;
