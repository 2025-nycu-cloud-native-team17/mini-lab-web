import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../utils/api';
import Header from '../Components/Header';
import Logout from '../Components/Logout';
import Modal from '../Components/Modal'; // ⭐ 使用你提供的 Modal

function PersonalProfile() {
    const { authFetch } = useApi();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);

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

    useEffect(() => {
        const fetchTasks = async () => {
            if (!user) return;
            try {
                const res = await authFetch("assignments");
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                const data = await res.json();
                const filtered = data
                    .filter(task => task.worker_id === user.userId)
                    .map(task => ({ ...task, status: task.status || 'assigned' }));
                setTasks(filtered);
            } catch (err) {
                console.error("Failed to load assignments:", err);
            }
        };
        fetchTasks();
    }, [user, authFetch]);

    const formatTime = (unixTime) => {
        const date = new Date(unixTime * 1000);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const timelineHours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);

    const tasksByHour = {};
    tasks.forEach((task) => {
        const hour = new Date(task.start * 1000).getHours();
        if (!tasksByHour[hour]) tasksByHour[hour] = [];
        tasksByHour[hour].push(task);
    });

    const handleDone = async (task) => {
        try {
            const res = await authFetch(
                `tasks/${task.task_id.toLowerCase()}/status`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'completed' })
                }
            );
            if (!res.ok) throw new Error(`Failed to update status`);
            const updatedTasks = tasks.map(t =>
                t.task_id === task.task_id ? { ...t, status: 'completed' } : t
            );
            setTasks(updatedTasks);
            setSelectedTask(null);
        } catch (err) {
            console.error(err);
            alert("Failed to mark task as done.");
        }
    };

    return (
        <div>
            <Header />
            <Logout />
            <div className="flex h-[calc(100vh-60px)] mt-6 overflow-hidden">
                {/* 左側：個人資料 */}
                <div className="w-1/2 p-6 overflow-auto border-r">
                    <h2 className="text-xl font-bold mb-4">User Info</h2>
                    {user ? (
                        <table className="table-auto border-collapse w-full">
                            <tbody>
                                <tr><td className="font-bold pr-2">Name:</td><td>{user.name}</td></tr>
                                <tr><td className="font-bold pr-2">Email:</td><td>{user.email}</td></tr>
                                <tr><td className="font-bold pr-2">Role:</td><td>{user.role}</td></tr>
                                <tr><td className="font-bold pr-2">Test Type:</td><td>{user.testType?.join(', ')}</td></tr>
                                <tr><td className="font-bold pr-2">Status:</td><td>{user.status}</td></tr>
                            </tbody>
                        </table>
                    ) : (
                        <p>Loading...</p>
                    )}
                </div>

                {/* 右側：時間軸 */}
                <div className="w-1/2 p-6 overflow-y-auto">
                    <h2 className="text-xl font-bold mb-4">Today's Timeline</h2>
                    <div className="space-y-4">
                        {timelineHours.map((timeLabel, hour) => (
                            <div key={hour} className="flex items-start gap-4">
                                <div className="w-20 text-right font-mono">{timeLabel}</div>
                                <div className="flex-1">
                                    {tasksByHour[hour] ? (
                                        tasksByHour[hour].map((task, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setSelectedTask(task)}
                                                className={`block w-full mb-2 ${task.status === 'completed'
                                                    ? 'bg-gray-300 text-gray-600'
                                                    : 'bg-blue-100 hover:bg-blue-200 text-blue-900'
                                                    } font-semibold p-2 rounded-md shadow-sm text-left`}
                                            >
                                                {task.task_id}
                                            </button>
                                        ))
                                    ) : (
                                        <div className="text-gray-400 italic">—</div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Modal 彈窗 */}
            <Modal isOpen={!!selectedTask} onClose={() => setSelectedTask(null)}>
                {selectedTask && (
                    <>
                        <h3 className="text-lg font-bold mb-4">Task Detail</h3>
                        <p><strong>Task ID:</strong> {selectedTask.task_id}</p>
                        <p><strong>Name:</strong> {selectedTask.task_name}</p>
                        <p><strong>Worker:</strong> {selectedTask.worker_id}</p>
                        <p><strong>Machine:</strong> {selectedTask.machine_id}</p>
                        <p><strong>Start:</strong> {formatTime(selectedTask.start)}</p>
                        <p><strong>End:</strong> {formatTime(selectedTask.end)}</p>
                        <p><strong>Status:</strong> {selectedTask.status}</p>

                        {selectedTask.status !== 'completed' && (
                            <div className="mt-4 text-right">
                                <button
                                    onClick={() => handleDone(selectedTask)}
                                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                                >
                                    Done
                                </button>
                            </div>
                        )}
                    </>
                )}
            </Modal>
        </div>
    );
}

export default PersonalProfile;
