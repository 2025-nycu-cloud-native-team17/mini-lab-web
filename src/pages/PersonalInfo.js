import React from 'react';
import Header from '../Components/Header.js';


const Schedule = ({ tasks }) => {
  // Define all possible time slots for display
  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  // Helper to convert 'HH:MM' to a comparable minute value
  const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Sort tasks by their start time to ensure correct rendering order
  const sortedTasks = [...tasks].sort((a, b) => 
    timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  );

  let currentTimePointer = timeToMinutes('09:00'); // Start at 9 AM

  return (
    <div className="w-full md:w-64 bg-gray-50 p-6 md:p-8 flex flex-col items-center relative border-t md:border-t-0 md:border-l border-gray-200">
      {/* Time column */}
      <div className="absolute left-6 top-8 hidden md:block text-gray-500 text-sm space-y-3.5">
        {timeSlots.map(time => (
          <p key={time}>{time}</p>
        ))}
      </div>

      {/* Task Boxes */}
      <div className="flex flex-col items-center w-full max-w-xs md:max-w-none md:ml-24 space-y-4">
        {sortedTasks.map((task, index) => {
          const taskStartTimeInMinutes = timeToMinutes(task.startTime);
          const taskEndTimeInMinutes = timeToMinutes(task.endTime);

          const timeBeforeTask = taskStartTimeInMinutes - currentTimePointer;
          const taskDuration = taskEndTimeInMinutes - taskStartTimeInMinutes;

          const elements = [];

          // Add empty space if there's a gap before this task
          if (timeBeforeTask > 0) {
            // Approximate height: 1 hour (60 minutes) is roughly 'h-16' based on your empty space.
            // Adjust this multiplier for more accurate spacing.
            const emptySpaceHeight = (timeBeforeTask / 60) * 64; // 64px for h-16
            elements.push(
              <div
                key={`empty-${index}-${currentTimePointer}`}
                style={{ height: `${emptySpaceHeight}px` }}
                className="w-full"
              ></div>
            );
          }

          // Render the task box
          // Approximate height for task: Use the same logic as empty space, adjusted for h-36 or h-24 reference
          const taskBoxHeight = (taskDuration / 60) * 64; // Base unit from h-16
          elements.push(
            <div
              key={task.task_id}
              style={{ height: `${Math.max(taskBoxHeight, 40)}px` }} // Ensure a minimum height, e.g., 40px
              className="bg-gray-200 rounded-lg w-full flex justify-center items-center text-lg font-bold text-gray-700"
            >
              {task.task_id}
            </div>
          );

          // Update the current time pointer to the end of the current task
          currentTimePointer = taskEndTimeInMinutes;

          return elements;
        })}

        {/* Add remaining empty space after the last task until 17:00 or end of view */}
        {currentTimePointer < timeToMinutes('17:00') && (
          <div
            key={`empty-end-${currentTimePointer}`}
            style={{ height: `${((timeToMinutes('17:00') - currentTimePointer) / 60) * 64}px` }}
            className="w-full"
          ></div>
        )}
      </div>
    </div>
  );
};

const PersonalInfo = () => {
    const personalData = {
        id: '6800eb6f039f52a3ac6b140b',
        userId: '0001',
        name: 'user1',
        email: 'user1@example.com',
        role: 'member',
        skills: 'Physical Property Testing',
        task: '[134534, 940561]',
        status: 'active',
        lastUpdate: '2025-04-17 12:39:36.944',
    };
    const tasks = [{task_id: 1234, startTime: '9:00', endTime: '11:00'}, {task_id: 12324, startTime: '12:00', endTime: '13:00'}];

    return (
        <div>
            <Header />
            <div className="p-4 sm:p-6 lg:p-8 flex justify-center items-start">
                <div className="bg-white rounded-lg overflow-hidden max-w-4xl w-full flex flex-col md:flex-row">
                    {/* Left Section: Personal Info */}
                    <div className="p-6 md:p-8 flex-1">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Personal Info.</h2>
                        <div>
                            {Object.entries(personalData).map(([key, value]) => (
                                !["createdAt", "updatedAt", "__v"].includes(key) && (
                                    <div key={key} className="mb-2">
                                        <label className="block text-sm font-medium text-gray-600 capitalize">
                                            {key.replace(/([A-Z])/g, ' $1')}
                                        </label>
                                        <div> {value} </div>
                                    </div>
                                )
                            ))}
                        </div>
                    </div>
                    <Schedule tasks={tasks}/>
                </div>
            </div>
        </div>
    );
};

export default PersonalInfo;