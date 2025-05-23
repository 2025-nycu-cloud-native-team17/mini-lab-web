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
    const [isEditing, setisEditing] = useState(false);
    const [isAdding, setisAdding] = useState(false);
    const [isDeleting, setisDeleting] = useState(false);
    const { authFetch } = useApi();
    const [formData, setFormData] = useState(() =>
        Object.fromEntries(props.attributes.map(attr => [attr, ""]))
    );

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            console.log(formData)
            const res = await authFetch(props.dataType, {
                method: "POST",
                body: JSON.stringify(formData),
            });
            await props.refresh();
        } catch (err) {
            console.error("送出失敗：", err);
        }
    };

    const handleDelete = async (id) => {
        try {
            const res = await authFetch(props.dataType + '/' + id, {
                method: "DELETE",
            });

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
                    <img src={save} alt="save" className="size-16 cursor-pointer" onClick={() => setisEditing(false)} />
                    : <img src={edit} alt="edit" className="size-16 cursor-pointer" onClick={() => setisEditing(true)} />
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
                        props.data.map((row, index) => (
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
                                                e.stopPropagation(); // ✅ 避免點刪除時跳頁
                                                handleDelete(row[0]);
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
                {isEditing ? <img src={add} alt="add" className="size-16 cursor-pointer" onClick={() => setisAdding(true)} /> : <></>}
            </div>
            <Modal isOpen={isAdding} onClose={() => setisAdding(false)}>
                <form className="w-[600px] space-y-4" onSubmit={handleSubmit}>
                    {
                        props.attributes.map((name, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <label htmlFor={name} className="w-1/5 text-right mr-2">
                                    {name}
                                </label>
                                <input
                                    type="text"
                                    id={name}
                                    name={name}
                                    value={formData[name]}
                                    onChange={handleChange}
                                    className="w-4/5 border-2 border-black rounded-md px-2 py-1 mx-5"
                                />
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
            <Modal isOpen={isDeleting} onClose={() => setisDeleting(false)}>
                <h3 className="text-2xl w-96 mb-12">Confirm Deletion</h3>
                <div className="flex justify-end">
                    <button className="border-2 border-black rounded-xl p-2 mr-4" onClick={() => setisDeleting(false)} >Cancel</button>
                    <button>Delete</button>
                </div>
            </Modal>
        </div>
    );
}

export default ListPanel;