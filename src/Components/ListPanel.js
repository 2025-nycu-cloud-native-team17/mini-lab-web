import React, { useState } from 'react';
import Modal from '../Components/Modal';
import edit from '../Icons/edit.png';
import add from '../Icons/add.png';
import del from '../Icons/delete.png';
import save from '../Icons/save.png';

function ListPanel(props) {
    const [isEditing, setisEditing] = useState(false);
    const [isAdding, setisAdding] = useState(false);

    return (
        <div id="list-panel" className="my-8 mx-auto w-fit">
            <div className="flex items-center justify-between text-4xl mb-4">
                <div>
                    {props.title}
                </div>
                {isEditing ?
                    <img src={save} alt="save" className="size-16 cursor-pointer" onClick={() => setisEditing(false)}/>
                    :<img src={edit} alt="edit" className="size-16 cursor-pointer" onClick={() => setisEditing(true)}/>
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
                            <tr key={row[0]}>
                                {
                                    row.map((value, cellIndex) => (
                                        <td className="px-16 py-4" key={cellIndex}>{value} </td>
                                    ))
                                }
                                {isEditing ? <td><img src={del} alt="delete" className="size-8 cursor-pointer" /></td> : <></>}
                            </tr>
                        ))
                    }
                </tbody>
            </table>
            <div className="flex justify-center bg-[#D9D9D9]">
                {isEditing ? <img src={add} alt="add" className="size-16 cursor-pointer" onClick={() => setisAdding(true)} /> : <></>}
            </div>
            <Modal isOpen={isAdding} onClose={() => setisAdding(false)}>12</Modal>
        </div>
    );
}

export default ListPanel;