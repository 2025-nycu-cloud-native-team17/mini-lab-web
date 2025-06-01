// src/tests/TaskManagement.test.js

import React from "react";
import {
    render,
    screen,
    fireEvent,
    act,
    waitFor,
} from "@testing-library/react";
import TaskManagement, {
    MembersTimeline,
    getNext14DaysFormatted,
    formatTimestampToTime,
    formatTimestampToDate,
    generateTimes,
} from "../pages/TaskManagement";
import { useNavigate } from "react-router-dom";
import { useApi } from "../utils/api";

// Mock Header to render a simple placeholder
jest.mock("../Components/Header.js", () => () => <div data-testid="header">Header</div>);

// Mock ListPanel to capture props passed in and render a placeholder
jest.mock("../Components/ListPanel.js", () => (props) => {
    return (
        <div
            data-testid="listpanel"
            data-props={JSON.stringify({
                title: props.title,
                columns: props.columns,
                data: props.data,
                attributes: props.attributes,
                dataType: props.dataType,
                hasRefresh: typeof props.refresh === "function",
            })}
        />
    );
});

// Mock useNavigate
jest.mock("react-router-dom", () => ({
    useNavigate: jest.fn(),
}));

// Mock useApi
jest.mock("../utils/api", () => ({
    useApi: jest.fn(),
}));

describe("Utility functions", () => {
    test("getNext14DaysFormatted returns 14 dates in 'M/D' format", () => {
        const dates = getNext14DaysFormatted();
        expect(Array.isArray(dates)).toBe(true);
        expect(dates).toHaveLength(14);
        // Each item should match regex like 'M/D' or 'MM/DD'
        dates.forEach((d) => {
            expect(d).toMatch(/^\d{1,2}\/\d{1,2}$/);
        });
        // The first date should be today’s date in that format
        const today = new Date();
        const expectedFirst = today.toLocaleDateString("en-US", {
            month: "numeric",
            day: "numeric",
        });
        expect(dates[0]).toBe(expectedFirst);
    });

    test("formatTimestampToTime returns HH:mm for given Unix timestamp", () => {
        // Use a known timestamp: Jan 1, 2021 14:05 local time
        const date = new Date(2021, 0, 1, 14, 5);
        const ts = Math.floor(date.getTime() / 1000);
        const formatted = formatTimestampToTime(ts);
        expect(formatted).toMatch(/^\d{2}:\d{2}$/);
        // We expect "14:05" (using hour12: false)
        expect(formatted).toBe(
            date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
            })
        );
    });

    test("formatTimestampToDate returns M/D for given Unix timestamp", () => {
        // Use Jan 2, 2021
        const date = new Date(2021, 0, 2, 0, 0);
        const ts = Math.floor(date.getTime() / 1000);
        const formatted = formatTimestampToDate(ts);
        expect(formatted).toMatch(/^\d{1,2}\/\d{1,2}$/);
        expect(formatted).toBe(
            date.toLocaleDateString("en-US", {
                month: "numeric",
                day: "numeric",
            })
        );
    });

    test("generateTimes generates correct sequence of hour strings", () => {
        const result = generateTimes("09:00", 3);
        expect(result).toEqual(["09:00", "10:00", "11:00"]);
        // If duration is zero, returns empty array
        expect(generateTimes("05:00", 0)).toEqual([]);
        // If startTime has single-digit hour
        expect(generateTimes("5:00", 2)).toEqual(["05:00", "06:00"]);
    });
});

describe("MembersTimeline Component", () => {
    let authFetchMock;
    let navigateMock;
    let consoleErrorSpy;
    let consoleWarnSpy;
    let alertSpy;

    beforeEach(() => {
        jest.clearAllMocks();
        authFetchMock = jest.fn();
        useApi.mockReturnValue({ authFetch: authFetchMock });

        navigateMock = jest.fn();
        useNavigate.mockReturnValue(navigateMock);

        consoleErrorSpy = jest
            .spyOn(console, "error")
            .mockImplementation(() => { });
        consoleWarnSpy = jest
            .spyOn(console, "warn")
            .mockImplementation(() => { });
        alertSpy = jest.spyOn(window, "alert").mockImplementation(() => { });
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
        consoleWarnSpy.mockRestore();
        alertSpy.mockRestore();
    });

    test("renders timeline header, times, and date selectors", async () => {
        // Mock authFetch to return empty assignments
        authFetchMock.mockResolvedValueOnce({
            ok: true,
            json: async () => [],
        });

        render(<MembersTimeline />);

        // Header div with text 'Timeline' should exist
        expect(screen.getByText("Timeline")).toBeInTheDocument();

        // There should be a schedule icon (alt="schedule")
        expect(screen.getByAltText("schedule")).toBeInTheDocument();

        // There should be two toggle buttons: Machine and Task
        expect(screen.getByText("Machine")).toBeInTheDocument();
        expect(screen.getByText("Task")).toBeInTheDocument();

        // The time headers: 12 slots from 09:00 to 20:00
        const times = generateTimes("09:00", 12);
        times.forEach((t) => {
            expect(screen.getAllByText(t).length).toBeGreaterThan(0);
        });

        // Date selector buttons: 14 buttons
        const dates = getNext14DaysFormatted();
        dates.forEach((d) => {
            expect(screen.getByText(d)).toBeInTheDocument();
        });

        // No assignments, so no cells with task or machine names
    });

    test("on initial load, fetchAssignments called and assignment cell click navigates to task", async () => {
        // Prepare assignments so that one overlaps 10:00 slot on first date
        const dates = getNext14DaysFormatted();
        const [month, day] = dates[0].split("/").map(Number);
        const year = new Date().getFullYear();
        const startDateObj = new Date(year, month - 1, day, 10, 0); // 10:00
        const endDateObj = new Date(year, month - 1, day, 11, 0); // 11:00
        const tsStart = Math.floor(startDateObj.getTime() / 1000);
        const tsEnd = Math.floor(endDateObj.getTime() / 1000);

        const assignments = [
            {
                id: "A1",
                machine_id: "MX100",
                task_name: "TestTask",
                task_id: "T1",
                start: tsStart,
                end: tsEnd,
            },
        ];

        // First call to authFetch is for 'assignments'
        authFetchMock.mockResolvedValueOnce({
            ok: true,
            json: async () => assignments,
        });

        render(<MembersTimeline />);

        // Wait for assignments to render
        await waitFor(() => {
            // The row key "MX100" should appear in the row header
            expect(screen.getByText("MX100")).toBeInTheDocument();
        });

        // Find the cell containing "TestTask" (since selected is 'machine')
        const cell = screen.getByText("TestTask");
        expect(cell).toBeInTheDocument();

        // Click the cell
        fireEvent.click(cell);

        // Should navigate to `/tasks/T1`
        expect(navigateMock).toHaveBeenCalledWith("/tasks/T1");
    });

    test("toggle to task mode and clicking cell fetches machines and navigates to machine", async () => {
        // Setup the same assignment
        const dates = getNext14DaysFormatted();
        const [month, day] = dates[0].split("/").map(Number);
        const year = new Date().getFullYear();
        const startDateObj = new Date(year, month - 1, day, 9, 0); // 09:00
        const endDateObj = new Date(year, month - 1, day, 10, 0); // 10:00
        const tsStart = Math.floor(startDateObj.getTime() / 1000);
        const tsEnd = Math.floor(endDateObj.getTime() / 1000);

        const assignments = [
            {
                id: "A2",
                machine_id: "MX200",
                task_name: "TaskTwo",
                task_id: "T2",
                start: tsStart,
                end: tsEnd,
            },
        ];

        // 1st authFetch: assignments
        // 2nd authFetch: machines when clicking cell
        authFetchMock
            .mockResolvedValueOnce({
                ok: true,
                json: async () => assignments,
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => [{ id: 5, machineId: "MX200" }],
            });

        render(<MembersTimeline />);

        // Wait for row header
        await waitFor(() => {
            expect(screen.getByText("MX200")).toBeInTheDocument();
        });

        // Toggle to "Task" mode
        fireEvent.click(screen.getByText("Task"));

        // Now the cell text should be "MX200" (since selected==='task')
        const taskCell = screen.getByText("MX200");
        expect(taskCell).toBeInTheDocument();

        // Click the cell
        await act(async () => {
            fireEvent.click(taskCell);
        });

        // Should have fetched machines and navigated to `/machines/5`
        expect(authFetchMock).toHaveBeenCalledWith("machines");
        expect(navigateMock).toHaveBeenCalledWith("/machines/5");
    });

    test("in task mode, if machine not found, warns and alerts", async () => {
        // Setup assignment as before
        const dates = getNext14DaysFormatted();
        const [month, day] = dates[0].split("/").map(Number);
        const year = new Date().getFullYear();
        const startDateObj = new Date(year, month - 1, day, 9, 0);
        const endDateObj = new Date(year, month - 1, day, 10, 0);
        const tsStart = Math.floor(startDateObj.getTime() / 1000);
        const tsEnd = Math.floor(endDateObj.getTime() / 1000);

        const assignments = [
            {
                id: "A3",
                machine_id: "MX300",
                task_name: "TaskThree",
                task_id: "T3",
                start: tsStart,
                end: tsEnd,
            },
        ];

        // 1st authFetch: assignments
        // 2nd authFetch: machines (empty array simulates not found)
        authFetchMock
            .mockResolvedValueOnce({
                ok: true,
                json: async () => assignments,
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => [],
            });

        render(<MembersTimeline />);

        await waitFor(() => {
            expect(screen.getByText("MX300")).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText("Task"));

        const taskCell = screen.getByText("MX300");
        await act(async () => {
            fireEvent.click(taskCell);
        });

        // Since no matching machine, should warn and alert
        expect(consoleWarnSpy).toHaveBeenCalledWith(
            "Machine not found for:",
            "MX300"
        );
        expect(alertSpy).toHaveBeenCalledWith("Machine not found.");
    });

    test("handleSchedule calls authFetch with schedule endpoint then fetchAssignments", async () => {
        // Prepare no assignments initially, then schedule success, then assignments
        authFetchMock
            .mockResolvedValueOnce({
                ok: true,
                json: async () => [],
            }) // initial fetchAssignments
            .mockResolvedValueOnce({
                ok: true,
            }) // schedule call
            .mockResolvedValueOnce({
                ok: true,
                json: async () => [],
            }); // fetchAssignments after schedule

        render(<MembersTimeline />);

        // Wait for initial load
        await waitFor(() => {
            expect(authFetchMock).toHaveBeenCalledWith("assignments");
        });

        // Click the schedule icon
        fireEvent.click(screen.getByAltText("schedule"));

        // After clicking, authFetch should have been called with "assignments/schedule"
        await waitFor(() => {
            expect(authFetchMock).toHaveBeenCalledWith("assignments/schedule");
        });

        // And then fetchAssignments called again
        expect(authFetchMock).toHaveBeenCalledWith("assignments");
    });

    test("fetchAssignments error logs error", async () => {
        // Simulate authFetch rejecting
        const fetchError = new Error("Fetch failed");
        authFetchMock.mockRejectedValueOnce(fetchError);

        render(<MembersTimeline />);

        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                "Failed to fetch assignments:",
                fetchError
            );
        });
    });
});

describe("TaskManagement Component", () => {
    let authFetchMock;
    let navigateMock;
    let consoleErrorSpy;
    let alertSpy;

    beforeEach(() => {
        jest.clearAllMocks();
        authFetchMock = jest.fn();
        useApi.mockReturnValue({ authFetch: authFetchMock });

        navigateMock = jest.fn();
        useNavigate.mockReturnValue(navigateMock);

        consoleErrorSpy = jest
            .spyOn(console, "error")
            .mockImplementation(() => { });
        alertSpy = jest.spyOn(window, "alert").mockImplementation(() => { });
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
        alertSpy.mockRestore();
    });

    // test("on successful fetch, passes formatted task data to ListPanel and renders MembersTimeline", async () => {
    //     // Prepare tasks array
    //     const tasksArray = [
    //         {
    //             id: "TK1",
    //             testType: "Thermal",
    //             inCharging: "Yes",
    //             status: "Open",
    //         },
    //         {
    //             id: "TK2",
    //             testType: "Electrical",
    //             inCharging: "No",
    //             status: "Closed",
    //         },
    //     ];
    //     // 1st call: TaskManagement refresh -> authFetch("tasks")
    //     // 2nd call: MembersTimeline initial -> authFetch("assignments")
    //     authFetchMock
    //         .mockResolvedValueOnce({
    //             ok: true,
    //             json: async () => tasksArray,
    //         })
    //         .mockResolvedValueOnce({
    //             ok: true,
    //             json: async () => [],
    //         });

    //     // ★ 不要用 act 包裹 render，render 後再用 waitFor 等待 state 更新
    //     render(<TaskManagement />);

    //     // Wait for ListPanel to receive updated data
    //     await waitFor(() => {
    //         const listpanelDivs = screen.getAllByTestId("listpanel");
    //         const taskListpanel = listpanelDivs[0];
    //         const passedProps = JSON.parse(taskListpanel.getAttribute("data-props"));
    //         expect(passedProps.data).toEqual([
    //             ["TK1", "TK1", "Thermal", "Yes", "Open"],
    //             ["TK2", "TK2", "Electrical", "No", "Closed"],
    //         ]);
    //     });

    //     // MembersTimeline should render as well (header 'Timeline')
    //     expect(screen.getByText("Timeline")).toBeInTheDocument();

    //     // navigate should NOT have been called
    //     expect(navigateMock).not.toHaveBeenCalled();
    // });

    test("when fetch tasks returns ok:false, alerts and navigates to /login and logs error", async () => {
        // Simulate ok:false
        authFetchMock.mockResolvedValueOnce({
            ok: false,
            status: 403,
        });

        // 同樣不要用 act 包裹 render
        render(<TaskManagement />);

        await waitFor(() => {
            expect(alertSpy).toHaveBeenCalledWith("Not Logged In");
            expect(navigateMock).toHaveBeenCalledWith("/login");
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                "Failed to load machines:",
                expect.any(Error)
            );
        });
    });

    test("when authFetch tasks throws, alerts and navigates to /login and logs error", async () => {
        // Simulate rejection
        const fetchErr = new Error("Network down");
        authFetchMock.mockRejectedValueOnce(fetchErr);

        render(<TaskManagement />);

        await waitFor(() => {
            expect(alertSpy).toHaveBeenCalledWith("Not Logged In");
            expect(navigateMock).toHaveBeenCalledWith("/login");
            // 只要確認至少有一次 call 第一個參數是 "Failed to load machines:"
            const calls = consoleErrorSpy.mock.calls;
            const matched = calls.some(call => call[0] === "Failed to load machines:");
            expect(matched).toBe(true);
        });
    });
});
