import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Components/Header.js';
import ListPanel from '../Components/ListPanel.js';
import { useApi } from '../utils/api'; // ⭐ 正確引入 API hooks
import schedule from '../Icons/schedule.png';

export function getNext14DaysFormatted() {
    const today = new Date();
    const next14Days = [];

    for (let i = 0; i < 14; i++) {
        const nextDate = new Date(today);
        nextDate.setDate(today.getDate() + i);
        const formattedDate = nextDate.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
        next14Days.push(formattedDate);
    }

    return next14Days;
}

export function formatTimestampToTime(ts) {
    const date = new Date(ts * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function formatTimestampToDate(ts) {
    const date = new Date(ts * 1000);
    return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
}

// 將 timeslot 改成 15 分鐘間隔
export function generateTimes(startTime, durationHours) {
    const times = [];
    let [hours, minutes] = startTime.split(':').map(Number);
    const totalSlots = durationHours * 4; // 一小時 4 個 15 分鐘時段

    for (let i = 0; i < totalSlots; i++) {
        const hh = hours.toString().padStart(2, '0');
        const mm = minutes.toString().padStart(2, '0');
        times.push(`${hh}:${mm}`);

        minutes += 15;
        if (minutes === 60) {
            minutes = 0;
            hours += 1;
        }
    }

    return times;
}

function MembersTimeline({ onScheduleComplete }) {
    const { authFetch } = useApi();
    const navigate = useNavigate();
    // 以 09:00 為起點，持續 12 小時，共產生 12*4 = 48 個 15 分鐘時段
    const times = generateTimes('09:00', 12);

    const [selected, setSelected] = useState('machine');
    const [assignments, setAssignments] = useState([]);

    const dates = getNext14DaysFormatted();
    const [selectedDate, setSelectedDate] = useState(dates[0]);

    const handleToggle = () => {
        setSelected(prev => (prev === 'machine' ? 'task' : 'machine'));
    };

    const fetchAssignments = useCallback(async () => {
        try {
            const res = await authFetch('assignments');
            if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
            const data = await res.json();
            setAssignments(data);
        } catch (err) {
            console.error('Failed to fetch assignments:', err);
        }
    }, [authFetch]);

    const handleSchedule = async () => {
        try {
            const res = await authFetch('assignments/schedule');
            if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
            await fetchAssignments();
            if (typeof onScheduleComplete === 'function') {
                onScheduleComplete();
            }
        } catch (err) {
            console.error('Failed to schedule:', err);
        }
    };

    useEffect(() => {
        fetchAssignments();
    }, [fetchAssignments]);

    const filteredAssignments = assignments.filter(
        a => formatTimestampToDate(a.start) === selectedDate
    );

    const rowKeys = Array.from(
        new Set(filteredAssignments.map(a => (selected === 'machine' ? a.machine_id : a.task_name)))
    );

    const renderAssignmentCell = (rowKey, time) => {
        return assignments.map(a => {
            const rowMatch =
                selected === 'machine'
                    ? a.machine_id === rowKey
                    : a.task_name === rowKey;
            const dateMatch = formatTimestampToDate(a.start) === selectedDate;
            if (!rowMatch || !dateMatch) return null;

            const start = new Date(a.start * 1000);
            const end = new Date(a.end * 1000);

            // 將 time（例如 "09:15"）解析成當天的虛擬時間段
            const [hour, minute] = time.split(':').map(Number);
            const slotStart = new Date(0, 0, 0, hour, minute);
            const slotEnd = new Date(0, 0, 0, hour, minute + 15);

            const taskStart = new Date(0, 0, 0, start.getHours(), start.getMinutes());
            const taskEnd = new Date(0, 0, 0, end.getHours(), end.getMinutes());

            const overlaps = taskStart < slotEnd && taskEnd > slotStart;

            if (overlaps) {
                const handleClick = async () => {
                    if (selected === 'task') {
                        try {
                            const res = await authFetch('machines');
                            if (!res.ok) throw new Error(`Failed to fetch machines: ${res.status}`);
                            const machines = await res.json();

                            const matched = machines.find(m => m.machineId === a.machine_id);
                            if (matched?.id) {
                                navigate(`/machines/${matched.id}`);
                            } else {
                                console.warn('Machine not found for:', a.machine_id);
                                alert('Machine not found.');
                            }
                        } catch (err) {
                            console.error('Error fetching machine data:', err);
                            alert('Failed to load machine data.');
                        }
                    } else {
                        navigate(`/tasks/${a.task_id}`);
                    }
                };

                return (
                    <div
                        className="h-full w-full bg-blue-500 text-white text-xs flex items-center justify-center cursor-pointer hover:bg-blue-600 transition"
                        key={a.id}
                        onClick={handleClick}
                        title={`Go to ${selected === 'task' ? 'Machine' : 'Task'} Details`}
                    >
                        {selected === 'machine' ? a.task_name : a.machine_id}
                    </div>
                );
            }
            return null;
        });
    };

    return (
        <div className="p-6 w-fit m-auto flex flex-col items-center">
            <div className="flex justify-between items-center w-full mb-4 text-xl">
                <div>Timeline</div>

                <img
                    src={schedule}
                    alt="schedule"
                    className="size-16 cursor-pointer"
                    onClick={handleSchedule}
                />
                <div className="flex border border-gray-400">
                    <button
                        className={`px-4 py-1 text-sm ${selected === 'machine' ? 'bg-black text-white' : 'bg-white text-black'}`}
                        onClick={handleToggle}
                    >
                        Machine
                    </button>
                    <button
                        className={`px-4 py-1 text-sm ${selected === 'task' ? 'bg-black text-white' : 'bg-white text-black'}`}
                        onClick={handleToggle}
                    >
                        Task
                    </button>
                </div>
            </div>

            <div className="w-full max-w-[1200px] overflow-x-auto">
                <div className="inline-block border rounded-lg min-w-full">
                    {/* Header */}
                    <div className="flex bg-gray-50 border-b">
                        {/* FIXED 第一欄 (空白格) */}
                        <div className="min-w-[200px] max-w-[200px] p-2 border-r font-semibold sticky left-0 z-20 bg-gray-50" />
                        {times.map((time, index) => (
                            <div
                                key={index}
                                className="w-20 text-center border-r text-xs py-2 flex-shrink-0"
                            >
                                {time}
                            </div>
                        ))}
                    </div>

                    {/* Rows */}
                    {rowKeys.map((rowKey, rowIndex) => (
                        <div key={rowIndex} className="flex border-b">
                            {/* FIXED 第一欄 (row label) */}
                            <div className="min-w-[200px] max-w-[200px] p-2 border-r bg-gray-100 truncate text-right sticky left-0 z-10">
                                {rowKey}
                            </div>
                            {times.map((time, colIndex) => (
                                <div
                                    key={colIndex}
                                    className="w-20 h-10 border-r relative flex items-center justify-center flex-shrink-0"
                                >
                                    {renderAssignmentCell(rowKey, time)}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* Date Selector */}
            <div className="flex justify-center mt-6 flex-wrap gap-2">
                {dates.map((date, index) => (
                    <button
                        key={index}
                        onClick={() => setSelectedDate(date)}
                        className={`px-4 py-1 rounded-full text-sm border transition-all duration-200 ${selectedDate === date
                                ? 'bg-black text-white border-black'
                                : 'bg-white text-black border-gray-300 hover:bg-gray-200'
                            }`}
                    >
                        {date}
                    </button>
                ))}
            </div>
        </div>
    );
}


function TaskManagement() {
    const { authFetch } = useApi();
    const [data, setData] = useState([]);
    const navigate = useNavigate();

    const columns = ["ID", "Test Type", "InCharging", "Status"];
    const attributes = ["name", "description", "testType", "duration", "earliest_start", "deadline"];
    const dataType = "tasks";

    const refresh = useCallback(async () => {
        try {
            const res = await authFetch("tasks");
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            const machines = await res.json();
            const formattedData = machines.map((m) => [
                m.id,
                m.id,
                m.testType,
                m.inCharging,
                m.status,
            ]);
            setData(formattedData);
        } catch (err) {
            console.error("Failed to load machines:", err);
            alert('Not Logged In');
            navigate('/login');
        }
    }, [authFetch, navigate]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return (
        <div>
            <Header />
            <ListPanel
                title="Tasks"
                columns={columns}
                data={data}
                attributes={attributes}
                dataType={dataType}
                refresh={refresh}
            />
            <MembersTimeline onScheduleComplete={refresh} />
        </div>
    );
}

export default TaskManagement;
