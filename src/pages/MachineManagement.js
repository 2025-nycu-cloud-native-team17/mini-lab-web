import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Components/Header.js';
import ListPanel from '../Components/ListPanel.js';
import { useApi } from '../utils/api'; // ⭐ 正確引入 API hooks


function MachineManagement() {
    const { authFetch } = useApi();  // ⭐ 用封裝好的 authFetch
    const [data, setData] = useState([]);
    const navigate = useNavigate();
    const columns = ["ID", "Name", "Test Type", "Count"];
    const attributes = ["name", "description", "testType", "status", "count"];
    const dataType = "machines";

    const refresh = useCallback(async () => {
        try {
            const res = await authFetch("machines");

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const machines = await res.json();

            const formattedData = machines.map((m) => [
                m.id,
                m.id,
                m.name,
                m.testType,
                m.count.toString(),
            ]);

            setData(formattedData);
        } catch (err) {
            console.error("Failed to load machines:", err);
            navigate('/login'); // 出錯，跳轉回 login
        }
    }, [authFetch, navigate]); // ⭐ 正確設依賴

    useEffect(() => {
        refresh();
    }, [refresh]);

    return (
        <div>
            <Header />
            <ListPanel title="Machines" columns={columns} data={data} attributes={attributes} dataType={dataType} refresh={refresh} />
        </div>
    );
}

export default MachineManagement;
