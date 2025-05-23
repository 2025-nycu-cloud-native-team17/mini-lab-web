import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Components/Header.js';
import ListPanel from '../Components/ListPanel.js';
import { useApi } from '../utils/api'; // ⭐ 正確引入 API hooks
import edit from '../Icons/edit.png'

function getNext14DaysFormatted() {
  const today = new Date();
  const next14Days = [];

  for (let i = 0; i < 14; i++) {
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + i);

    const month = nextDate.getMonth() + 1;
    const day = nextDate.getDate();

    const formattedDate = `${month}/${day}`;
    next14Days.push(formattedDate);
  }

  return next14Days;
}

function generateTimes(startTime, duration) {
  const times = [];
  let currentTime = startTime;

  for (let i = 0; i < duration; i++) {
    times.push(currentTime);
    let [hours] = currentTime.split(":").map(Number);
    hours++;
    if (hours < 10) {
      currentTime = `0${hours}:00`;
    } else {
      currentTime = `${hours}:00`;
    }
  }

  return times;
}

function MembersTimeline(props) {
  const members = ["38202", "54027", "91634"];
  const times = generateTimes("09:00", 12);
  const dates = getNext14DaysFormatted();

  const [selectedDate, setSelectedDate] = useState(dates[0]);

  return (
    <div className="p-6 w-fit m-auto flex flex-col items-center">
      <div className="flex items-center justify-between text-2xl mb-4 w-full">
        <div>{"Members Timeline"}</div>
        <img src={edit} alt="edit" className="size-10" />
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block border rounded-lg mx-auto">
          {/* Header Row */}
          <div className="flex bg-gray-50 border-b">
            <div className="w-20 border-r p-2" />
            {times.map((time, index) => (
              <div
                key={index}
                className="w-24 text-center text-sm py-2 border-r"
              >
                {time}
              </div>
            ))}
          </div>

          {/* Members Rows */}
          {members.map((member, rowIndex) => (
            <div key={rowIndex} className="flex border-b">
              <div className="w-20 text-sm p-2 border-r text-right bg-gray-100">
                {member}
              </div>
              {times.map((_, colIndex) => (
                <div
                  key={colIndex}
                  className="w-24 h-12 border-r hover:bg-gray-50"
                ></div>
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
                ? "bg-black text-white border-black"
                : "bg-white text-black border-gray-300 hover:bg-gray-200"
              }`}
          >
            {date}
          </button>
        ))}
      </div>
    </div>
  );
};


function TaskManagement() {
  const { authFetch } = useApi();  // ⭐ 用封裝好的 authFetch
  const [data, setData] = useState([]);
  const navigate = useNavigate();
  const columns = ["ID", "Test Type", "InCharging", "Status"];
  const attributes = ["name", "description", "testType", "inCharging", "dueDate", "status"];
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
      alert('Not Logged In')
      navigate('/login'); // 出錯，跳轉回 login
    }
  }, [authFetch, navigate]); // ⭐ 正確設依賴

  useEffect(() => {
      refresh();
  }, [refresh]);

  return (
    <div>
      <Header />
      <ListPanel title="Tasks" columns={columns} data={data} attributes={attributes} dataType={dataType} refresh={refresh} />
      <MembersTimeline data={data} />
    </div>
  );
}

export default TaskManagement;
