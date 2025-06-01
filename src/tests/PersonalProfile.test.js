// src/tests/PersonalProfile.test.js

import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import PersonalProfile from "../pages/PersonalProfile";
import { useNavigate } from "react-router-dom";
import { useApi } from "../utils/api";

// Mock Header, Logout, Modal components
jest.mock("../Components/Header", () => () => <div data-testid="header">Header</div>);
jest.mock("../Components/Logout", () => () => <div data-testid="logout">Logout</div>);
jest.mock("../Components/Modal", () => ({ isOpen, onClose, children }) =>
    isOpen ? <div data-testid="modal">{children}</div> : null
);

// Mock useNavigate
jest.mock("react-router-dom", () => ({
    useNavigate: jest.fn(),
}));

// Mock useApi
jest.mock("../utils/api", () => ({
    useApi: jest.fn(),
}));

describe("PersonalProfile Component", () => {
    let authFetchMock;
    let navigateMock;
    let consoleErrorSpy;
    let alertSpy;

    const sampleUser = {
        userId: "U1",
        name: "Bob",
        email: "bob@example.com",
        role: "technician",
        testType: ["Electrical", "Thermal"],
        status: "active",
    };

    const sampleTasks = [
        {
            task_id: "T1",
            task_name: "Inspect",
            worker_id: "U1",
            machine_id: "M1",
            start: 1625155200, // corresponds to hour=12 (UTC)
            end: 1625158800,
            status: "assigned",
        },
        {
            task_id: "T2",
            task_name: "Repair",
            worker_id: "U1",
            machine_id: "M2",
            start: 1625166000, // corresponds to hour=15 (UTC)
            end: 1625169600,
            status: "completed",
        },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        navigateMock = jest.fn();
        useNavigate.mockReturnValue(navigateMock);

        authFetchMock = jest.fn();
        useApi.mockReturnValue({ authFetch: authFetchMock });

        consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => { });
        alertSpy = jest.spyOn(window, "alert").mockImplementation(() => { });
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
        alertSpy.mockRestore();
    });

    test("fetches user and tasks, displays profile and timeline, and opens modal", async () => {
        // 1st call: fetch user, 2nd call: fetch assignments
        authFetchMock
            .mockResolvedValueOnce({
                ok: true,
                json: async () => sampleUser,
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => sampleTasks,
            });

        render(<PersonalProfile />);

        // Wait for profile section to appear
        await waitFor(() => {
            expect(screen.getByText("Name:")).toBeInTheDocument();
        });

        // Profile fields
        expect(screen.getByText("Name:")).toBeInTheDocument();
        expect(screen.getByText("Bob")).toBeInTheDocument();
        expect(screen.getByText("Email:")).toBeInTheDocument();
        expect(screen.getByText("bob@example.com")).toBeInTheDocument();
        expect(screen.getByText("Role:")).toBeInTheDocument();
        expect(screen.getByText("technician")).toBeInTheDocument();
        expect(screen.getByText("Test Type:")).toBeInTheDocument();
        expect(screen.getByText("Electrical, Thermal")).toBeInTheDocument();
        expect(screen.getByText("Status:")).toBeInTheDocument();
        expect(screen.getByText("active")).toBeInTheDocument();

        // Wait for timeline tasks to render
        await waitFor(() => {
            expect(screen.getByText("T1")).toBeInTheDocument();
        });

        // Click task to open modal
        fireEvent.click(screen.getByText("T1"));
        const modal = await screen.findByTestId("modal");

        // Within modal, ensure details appear
        const q = within(modal);
        expect(q.getByText("Task Detail")).toBeInTheDocument();
        expect(q.getByText("Task ID:")).toBeInTheDocument();
        expect(q.getByText("T1")).toBeInTheDocument(); // within modal
        expect(q.getByText("Name:")).toBeInTheDocument();
        expect(q.getByText("Inspect")).toBeInTheDocument();
        expect(q.getByText("Worker:")).toBeInTheDocument();
        expect(q.getByText("U1")).toBeInTheDocument();
        expect(q.getByText("Machine:")).toBeInTheDocument();
        expect(q.getByText("M1")).toBeInTheDocument();
        expect(q.getByText("Start:")).toBeInTheDocument();
        expect(q.getByText("End:")).toBeInTheDocument();
        expect(q.getByText("Status:")).toBeInTheDocument();

        // Since status is 'assigned', Done button should appear
        expect(q.getByText("Done")).toBeInTheDocument();
    });

    test("navigates to /login on user fetch failure", async () => {
        authFetchMock.mockResolvedValueOnce({ ok: false, status: 401 });

        render(<PersonalProfile />);

        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                "Failed to load user:",
                expect.any(Error)
            );
            expect(navigateMock).toHaveBeenCalledWith("/login");
        });
    });

    test("shows timeline placeholders if assignments fetch fails", async () => {
        // 1st call returns user, 2nd call fails assignments
        authFetchMock
            .mockResolvedValueOnce({
                ok: true,
                json: async () => sampleUser,
            })
            .mockResolvedValueOnce({ ok: false, status: 500 });

        render(<PersonalProfile />);

        // Wait for profile
        await waitFor(() => {
            expect(screen.getByText("Name:")).toBeInTheDocument();
        });

        // Timeline placeholders: check at least one hour has “—”
        expect(screen.getAllByText("—")[0]).toBeInTheDocument();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            "Failed to load assignments:",
            expect.any(Error)
        );
    });

    test("marks task as done successfully and closes modal", async () => {
        // 1: fetch user, 2: fetch assignments, 3: PUT status
        authFetchMock
            .mockResolvedValueOnce({
                ok: true,
                json: async () => sampleUser,
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => [sampleTasks[0]],
            })
            .mockResolvedValueOnce({ ok: true });

        render(<PersonalProfile />);

        // Wait for task button
        await waitFor(() => {
            expect(screen.getByText("T1")).toBeInTheDocument();
        });

        // Open modal
        fireEvent.click(screen.getByText("T1"));
        const modal = await screen.findByTestId("modal");

        // Click Done inside modal
        const q = within(modal);
        fireEvent.click(q.getByText("Done"));

        await waitFor(() => {
            // After completion, modal should close
            expect(screen.queryByTestId("modal")).toBeNull();
        });

        // Verify PUT called with correct endpoint and body
        expect(authFetchMock).toHaveBeenCalledWith("tasks/t1/status", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "completed" }),
        });
    });

    test("shows alert on mark task done failure", async () => {
        // 1: fetch user, 2: fetch assignments, 3: PUT fails
        authFetchMock
            .mockResolvedValueOnce({
                ok: true,
                json: async () => sampleUser,
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => [sampleTasks[0]],
            })
            .mockResolvedValueOnce({ ok: false });

        render(<PersonalProfile />);

        // Wait for task button
        await waitFor(() => {
            expect(screen.getByText("T1")).toBeInTheDocument();
        });

        // Open modal
        fireEvent.click(screen.getByText("T1"));
        const modal = await screen.findByTestId("modal");

        // Click Done inside modal
        const q = within(modal);
        fireEvent.click(q.getByText("Done"));

        await waitFor(() => {
            expect(alertSpy).toHaveBeenCalledWith("Failed to mark task as done.");
        });
    });
});
