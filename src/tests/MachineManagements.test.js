// src/tests/MachineManagement.test.js

import React from "react";
import { render, screen, act, waitFor } from "@testing-library/react";
import MachineManagement from "../pages/MachineManagement";
import { useNavigate } from "react-router-dom";
import { useApi } from "../utils/api";

// Mock Header to render a simple placeholder
jest.mock("../Components/Header.js", () => () => <div data-testid="header">Header</div>);

// Mock ListPanel to capture the props passed in
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
                // We won't stringify functions; just note that refresh exists
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

describe("MachineManagement Component", () => {
    let authFetchMock;
    let navigateMock;
    let consoleErrorSpy;

    beforeEach(() => {
        jest.clearAllMocks();

        // Prepare mocks
        authFetchMock = jest.fn();
        useApi.mockReturnValue({ authFetch: authFetchMock });

        navigateMock = jest.fn();
        useNavigate.mockReturnValue(navigateMock);

        // Spy on console.error to suppress and verify calls
        consoleErrorSpy = jest
            .spyOn(console, "error")
            .mockImplementation(() => { });
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    test("on successful fetch, passes formatted data to ListPanel", async () => {
        // Arrange: authFetch resolves with ok:true and JSON data
        const machinesArray = [
            {
                id: 1,
                machineId: "M001",
                name: "Machine A",
                testType: "Thermal",
                count: 3,
            },
            {
                id: 2,
                machineId: "M002",
                name: "Machine B",
                testType: "Electrical",
                count: 5,
            },
        ];
        authFetchMock.mockResolvedValueOnce({
            ok: true,
            json: async () => machinesArray,
        });

        // Act: render the component
        await act(async () => {
            render(<MachineManagement />);
        });

        // Wait for ListPanel to appear
        await waitFor(() => {
            expect(screen.getByTestId("listpanel")).toBeInTheDocument();
        });

        // Assert: Header rendered
        expect(screen.getByTestId("header")).toBeInTheDocument();

        // Get the props passed to ListPanel
        const listpanelDiv = screen.getByTestId("listpanel");
        const passedProps = JSON.parse(listpanelDiv.getAttribute("data-props"));

        // Title, columns, attributes, dataType should match
        expect(passedProps.title).toBe("Machines");
        expect(passedProps.columns).toEqual(["ID", "Name", "Test Type", "Count"]);
        expect(passedProps.attributes).toEqual([
            "machineId",
            "name",
            "description",
            "testType",
            "status",
            "count",
        ]);
        expect(passedProps.dataType).toBe("machines");
        expect(passedProps.hasRefresh).toBe(true);

        // Data should be formatted: [id, machineId, name, testType, countString]
        expect(passedProps.data).toEqual([
            [1, "M001", "Machine A", "Thermal", "3"],
            [2, "M002", "Machine B", "Electrical", "5"],
        ]);

        // navigate should NOT have been called on success
        expect(navigateMock).not.toHaveBeenCalled();
    });

    test("when fetch returns ok:false, navigates to /login and logs error", async () => {
        // Arrange: authFetch resolves with ok:false
        authFetchMock.mockResolvedValueOnce({
            ok: false,
            status: 500,
        });

        // Act: render the component
        await act(async () => {
            render(<MachineManagement />);
        });

        // Wait for effect to run
        await waitFor(() => {
            // Because of error, navigate('/login') should have been called
            expect(navigateMock).toHaveBeenCalledWith("/login");
        });

        // console.error should have been called with prefix
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            "Failed to load machines:",
            expect.any(Error)
        );
    });

    test("when authFetch throws, navigates to /login and logs error", async () => {
        // Arrange: authFetch rejects
        const fetchError = new Error("Network Error");
        authFetchMock.mockRejectedValueOnce(fetchError);

        // Act: render the component
        await act(async () => {
            render(<MachineManagement />);
        });

        // Wait for effect to run
        await waitFor(() => {
            expect(navigateMock).toHaveBeenCalledWith("/login");
        });

        // console.error should have been called with the thrown error
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            "Failed to load machines:",
            fetchError
        );
    });
});
