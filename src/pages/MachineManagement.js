import React from 'react';
import Header from '../Components/Header.js'
import ListPanel from '../Components/ListPanel.js'

let fake_title = "Machines"
let fake_columns = [
    "Name", "Test Type", "Count"
]
let fake_data = [
    ["Thermal Shock Chamber", "Thermal Shock Testing", "3"],
    ["Multimeters", "Electrical Compliance Test", "10"],
    ["Clamp Meters", "Electrical Compliance Test", "7"]
]

function MachineManagement() {
    return (
        <div>
            <Header />
            <ListPanel title={fake_title} columns={fake_columns} data={fake_data} />
        </div>
    );
}

export default MachineManagement