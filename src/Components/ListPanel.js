import React from 'react';
import edit from '../Icons/edit.png'

function ListPanel(props) {
    return (
        <div id="list-panel" className="my-8 mx-auto w-fit">
            <div className="flex items-center justify-between text-4xl mb-4">
                <div>
                    {props.title}
                </div>
                <img src={edit} alt="edit" className="size-16" />
            </div>
            <table className="bg-[#D9D9D9] text-2xl">
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
                                        <td className="px-16 py-4" key={cellIndex}>{value}</td>
                                    ))
                                }
                            </tr>
                        ))
                    }
                </tbody>
            </table>
        </div>
    );
}

export default ListPanel;