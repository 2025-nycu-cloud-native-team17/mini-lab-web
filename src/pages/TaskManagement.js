import React from 'react';
import Header from '../Components/Header.js'
import ListPanel from '../Components/ListPanel.js'

let fake_title = "Tasks"
let fake_columns = [
    "ID", "Test Type", "Person in Charge", "Status"
]
let fake_data = [
    ["123512", "Thermal Shock Testing", "None", "Not assigned"],
    ["134534", "Electrical Compliance Test", "Bob", "Proceeding"],
    ["513567", "Electrical Compliance Test", "Bob", "Done"],
]

function TaskManagement() {
    return (
        <div>
            <Header />
            <ListPanel title={fake_title} columns={fake_columns} data={fake_data} />
        </div>
    );
}

export default TaskManagement