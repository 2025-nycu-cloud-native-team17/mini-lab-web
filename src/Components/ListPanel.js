import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../Components/Modal';
import edit from '../Icons/edit.png';
import add from '../Icons/add.png';
import del from '../Icons/delete.png';
import save from '../Icons/save.png';
import { useApi } from '../utils/api';

function ListPanel(props) {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const { authFetch } = useApi();
    const [formData, setFormData] = useState(() =>
        Object.fromEntries(props.attributes.map(attr => [attr, ""]))
    );

    const handleChange = (e) => {
        const { name, value, options, type } = e.target;

        if (name === "testType" && type === "select-multiple") {
            const selectedValues = Array.from(options)
                .filter(option => option.selected)
                .map(option => option.value);

            setFormData(prev => ({
                ...prev,
                [name]: selectedValues
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 複製 formData 並進行欄位轉換
        const payload = { ...formData };

        // 如果有 duration，將輸入的值轉為秒
        if (payload.duration) {
            payload.duration = Number(payload.duration) * 60;
        }

        // 如果有 earliest_start 或 deadline，將本地時間轉換為 Unix 時間戳（秒）
        ["earliest_start", "deadline"].forEach(field => {
            if (payload[field]) {
                const dateMs = new Date(payload[field]).getTime();
                payload[field] = Math.floor(dateMs / 1000);
            }
        });

        try {
            const res = await authFetch(props.dataType, {
                method: "POST",
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                return res.json().then(error => {
                    console.error('Error:', error);
                });
            }

            await props.refresh();
            setIsAdding(false);
            // 重置表單
            setFormData(Object.fromEntries(props.attributes.map(attr => [attr, ""])));
        } catch (err) {
            console.error("送出失敗：", err);
        }
    };

    const handleDelete = async () => {
        if (deletingId === null) return;
        try {
            const res = await authFetch(`${props.dataType}/${deletingId}`, {
                method: "DELETE",
            });

            setIsDeleting(false);
            setDeletingId(null);
            await props.refresh();
        } catch (err) {
            console.error("刪除失敗：", err);
        }
    };

    return (
        <div id="list-panel" className="my-8 mx-auto w-fit">
            <div className="flex items-center justify-between text-4xl mb-4">
                <div>
                    {props.title}
                </div>
                {isEditing ?
                    <img src={save} alt="save" className="size-16 cursor-pointer" onClick={() => setIsEditing(false)} />
                    : <img src={edit} alt="edit" className="size-16 cursor-pointer" onClick={() => setIsEditing(true)} />
                }
            </div>
            <table className="bg-[#D9D9D9] text-2xl text-center">
                <thead>
                    <tr>
                        {
                            props.columns.map((name, index) => (
                                <th scope="col" key={index}>{name}</th>
                            ))
                        }
                    </tr>
                </thead>
                <tbody>
                    {
                        props.data.map((row) => (
                            <tr
                                key={row[0]}
                                className={`cursor-pointer ${isEditing ? '' : 'hover:bg-gray-300'}`}
                                onClick={() => !isEditing && navigate(`/${props.dataType}/${row[0]}`)}
                            >
                                {
                                    row.slice(1).map((value, cellIndex) => (
                                        <td className="px-16 py-4" key={cellIndex}>{value}</td>
                                    ))
                                }
                                {isEditing ? (
                                    <td>
                                        <img
                                            src={del}
                                            alt="delete"
                                            className="size-8 cursor-pointer"
                                            onClick={(e) => {
                                                e.stopPropagation(); // avoid navigation
                                                setDeletingId(row[0]);
                                                setIsDeleting(true);
                                            }}
                                        />
                                    </td>
                                ) : null}
                            </tr>
                        ))
                    }
                </tbody>
            </table>
            <div className="flex justify-center bg-[#D9D9D9]">
                {isEditing ? <img src={add} alt="add" className="size-16 cursor-pointer" onClick={() => setIsAdding(true)} /> : null}
            </div>
            {/* Add Item Modal */}
            <Modal isOpen={isAdding} onClose={() => setIsAdding(false)}>
                <form className="w-[600px] space-y-4" onSubmit={handleSubmit}>
                    {
                        props.attributes.map((name, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <label htmlFor={name} className="w-1/5 text-right mr-2">
                                    {name}
                                </label>
                                {
                                    // 如果是 Members 且屬性為 testType，使用多選下拉
                                    (props.title === "Members" && name === "testType") ? (
                                        <select
                                            id={name}
                                            name={name}
                                            multiple
                                            value={formData[name] || []}
                                            onChange={handleChange}
                                            className="w-4/5 border-2 border-black rounded-md px-2 py-1 mx-5"
                                        >
                                            <option value="Thermal Testing">Thermal Testing</option>
                                            <option value="Electrical Testing">Electrical Testing</option>
                                            <option value="Physical Property Testing">Physical Property Testing</option>
                                        </select>
                                    ) : (name === "duration") ? (
                                        // duration 欄位，使用數字輸入
                                        <input
                                            type="number"
                                            id={name}
                                            name={name}
                                            value={formData[name]}
                                            onChange={handleChange}
                                            className="w-4/5 border-2 border-black rounded-md px-2 py-1 mx-5"
                                        />
                                    ) : (name === "earliest_start" || name === "deadline") ? (
                                        // 使用本地時間的 datetime-local 輸入
                                        <input
                                            type="datetime-local"
                                            id={name}
                                            name={name}
                                            value={formData[name]}
                                            onChange={handleChange}
                                            className="w-4/5 border-2 border-black rounded-md px-2 py-1 mx-5"
                                        />
                                    ) : (
                                        // 預設文字輸入
                                        <input
                                            type="text"
                                            id={name}
                                            name={name}
                                            value={formData[name]}
                                            onChange={handleChange}
                                            className="w-4/5 border-2 border-black rounded-md px-2 py-1 mx-5"
                                        />
                                    )
                                }
                            </div>
                        ))
                    }
                    <div className="flex justify-end">
                        <button type="submit" className="border-2 border-black rounded-xl p-2 mx-5">
                            Add
                        </button>
                    </div>
                </form>
            </Modal>
            {/* Delete Confirmation Modal */}
            <Modal isOpen={isDeleting} onClose={() => { setIsDeleting(false); setDeletingId(null); }}>
                <h3 className="text-2xl w-96 mb-12">Confirm Deletion</h3>
                <div className="flex justify-end">
                    <button className="border-2 border-black rounded-xl p-2 mr-4" onClick={() => { setIsDeleting(false); setDeletingId(null); }} >Cancel</button>
                    <button className="border-2 border-red-600 text-red-600 rounded-xl p-2" onClick={handleDelete}>Delete</button>
                </div>
            </Modal>
        </div>
    );
}

export default ListPanel;
