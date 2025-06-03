import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../Components/Header.js';
import { useApi } from '../utils/api';
import edit from '../Icons/edit.png';
import save from '../Icons/save.png';

export const formatDate = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleString();
};

const Modification = () => {
    const { dataType, id } = useParams();
    const { authFetch } = useApi();
    const [formData, setFormData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            let data;

            if (dataType === 'user') {
                const res = await authFetch(`${dataType}/${id}`);
                if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
                data = await res.json();
            } else {
                const res = await authFetch(`${dataType}`);
                if (!res.ok) throw new Error(`Failed to fetch list: ${res.status}`);
                const list = await res.json();
                data = list.find(item => item.id === id);
                if (!data) throw new Error(`Item with id ${id} not found`);
            }

            setFormData(data);
        } catch (error) {
            console.error("Fetch failed", error);
            alert("讀取資料失敗，請稍後再試");
        }
    }, [authFetch, dataType, id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const unixToDatetimeLocal = (unix) => {
        const date = new Date(unix * 1000);
        const pad = (n) => String(n).padStart(2, '0');

        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1);
        const day = pad(date.getDate());
        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());

        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const formatBusyWindow = (ranges) => {
        return ranges.map(([start, end]) => {
            return `${unixToReadableLocal(start)} ~ ${unixToReadableLocal(end)}`;
        }).join('\n');
    };

    const datetimeLocalToUnix = (datetimeStr) => {
        return Math.floor(new Date(datetimeStr).getTime() / 1000);
    };

    const unixToReadableLocal = (unix) => {
        const date = new Date(unix * 1000);
        const pad = (n) => String(n).padStart(2, '0');

        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1);
        const day = pad(date.getDate());
        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());

        return `${year}-${month}-${day} ${hours}:${minutes}`;
    };

    const handleChange = (field, value) => {
        setFormData(prev => {
            let updatedValue = value;

            // 處理時間欄位，轉成 Unix timestamp（秒）
            if (['earliest_start', 'deadline'].includes(field)) {
                updatedValue = datetimeLocalToUnix(value);
            }

            // 處理 duration 欄位，先乘以 60（前端輸入的時候是以分鐘為單位）
            if (field === 'duration') {
                const minutes = Number(value);
                if (!isNaN(minutes)) {
                    updatedValue = minutes * 60;
                } else {
                    updatedValue = 0;
                }
            }

            return { ...prev, [field]: updatedValue };
        });
    };

    const handleSave = async () => {
        try {
            const res = await authFetch(`${dataType}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                throw new Error(`Failed to update: ${res.status}`);
            }

            // 等 PUT 成功後，重新 GET 一次最新資料
            await fetchData();
        } catch (error) {
            console.error("Update failed", error);
            alert("更新失敗，請稍後再試");
        }
    };

    const toggleEdit = () => {
        if (isEditing) {
            handleSave();
        }
        setIsEditing(!isEditing);
    };

    if (!formData) {
        return <div className="text-center mt-20 text-xl">Loading...</div>;
    }

    return (
        <div>
            <Header />
            <div className="max-w-3xl p-6 mx-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-3xl font-semibold capitalize">{dataType} Info</h2>
                    <img
                        src={isEditing ? save : edit}
                        alt={isEditing ? "save" : "edit"}
                        className="size-12 cursor-pointer"
                        onClick={toggleEdit}
                    />
                </div>

                {Object.entries(formData).map(([key, value]) => (
                    !["createdAt", "updatedAt", "__v"].includes(key) && (
                        <div key={key} className="mb-2">
                            <label className="block text-sm font-medium text-gray-600 capitalize">
                                {key.replace(/([A-Z])/g, ' $1')}{key === 'duration' ? ' (minute)' : ''}
                            </label>
                            {isEditing && key !== 'id' && key !== 'busywindow' ? (
                                <input
                                    type={
                                        ['earliest_start', 'deadline'].includes(key)
                                            ? "datetime-local"
                                            : key === 'duration'
                                                ? "number"
                                                : "text"
                                    }
                                    value={
                                        ['earliest_start', 'deadline'].includes(key)
                                            ? unixToDatetimeLocal(value)
                                            : key === 'duration'
                                                ? Math.floor(value / 60) // 顯示分鐘
                                                : Array.isArray(value)
                                                    ? JSON.stringify(value)
                                                    : value
                                    }
                                    onChange={(e) => handleChange(key, e.target.value)}
                                    className="w-full mt-1 px-3 py-1 border rounded-md text-sm"
                                />

                            ) : (
                                <p className="mt-1 px-3 py-1 text-sm text-gray-800 bg-gray-100 border rounded-md whitespace-pre-line">
                                    {['earliest_start', 'deadline'].includes(key)
                                        ? unixToReadableLocal(value)
                                        : key === 'duration'
                                            ? Math.floor(value / 60) // 只顯示分鐘
                                            : key === 'busywindow' && Array.isArray(value)
                                                ? formatBusyWindow(value)
                                                : Array.isArray(value)
                                                    ? JSON.stringify(value)
                                                    : value}
                                </p>
                            )}
                        </div>
                    )
                ))}

                <p className="text-xs text-gray-500 mt-4">
                    Last Update<br />{formatDate(formData.updatedAt)}
                </p>
            </div>
        </div>
    );
};

export default Modification;