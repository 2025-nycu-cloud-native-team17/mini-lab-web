// src/tests/MemberManagement.test.js

import React from "react";
import { render, screen, act, waitFor } from "@testing-library/react";
import MemberManagement from "../pages/MemberManagement";
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

describe("MemberManagement Component", () => {
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
        const usersArray = [
            {
                id: 10,
                userId: "U100",
                name: "Alice",
                testType: "Electrical Testing",
                inCharging: "Yes",
            },
            {
                id: 20,
                userId: "U200",
                name: "Bob",
                testType: "Thermal Testing",
                inCharging: "No",
            },
        ];
        authFetchMock.mockResolvedValueOnce({
            ok: true,
            json: async () => usersArray,
        });

        // Act: render the component
        await act(async () => {
            render(<MemberManagement />);
        });

        // Wait for ListPanel to appear
        await waitFor(() => {
            expect(screen.getByTestId("listpanel")).toBeInTheDocument();
        });

        // Assert: Header rendered
        expect(screen.getByTestId("header")).toBeInTheDocument();

        // Extract props passed to ListPanel
        const listpanelDiv = screen.getByTestId("listpanel");
        const passedProps = JSON.parse(listpanelDiv.getAttribute("data-props"));

        // Verify title, columns, attributes, dataType, hasRefresh
        expect(passedProps.title).toBe("Members");
        expect(passedProps.columns).toEqual([
            "ID",
            "Name",
            "Skills",
            "InCharging",
        ]);
        expect(passedProps.attributes).toEqual([
            "userId",
            "name",
            "email",
            "password",
            "role",
            "testType",
            "status",
        ]);
        expect(passedProps.dataType).toBe("user");
        expect(passedProps.hasRefresh).toBe(true);

        // Verify data formatting: [id, userId, name, testType, inCharging]
        expect(passedProps.data).toEqual([
            [10, "U100", "Alice", "Electrical Testing", "Yes"],
            [20, "U200", "Bob", "Thermal Testing", "No"],
        ]);

        // navigate should NOT have been called on success
        expect(navigateMock).not.toHaveBeenCalled();
    });

    test("when fetch returns ok:false, navigates to /login and logs error", async () => {
        // Arrange: authFetch resolves with ok:false
        authFetchMock.mockResolvedValueOnce({
            ok: false,
            status: 404,
        });

        // Act: render the component
        await act(async () => {
            render(<MemberManagement />);
        });

        // Wait for effect to run and navigate to be called
        await waitFor(() => {
            expect(navigateMock).toHaveBeenCalledWith("/login");
        });

        // console.error should have been called with the thrown error
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            "Failed to load machines:",
            expect.any(Error)
        );
    });

    test("when authFetch throws, navigates to /login and logs error", async () => {
        // Arrange: authFetch rejects
        const fetchError = new Error("Network failure");
        authFetchMock.mockRejectedValueOnce(fetchError);

        // Act: render the component
        await act(async () => {
            render(<MemberManagement />);
        });

        // Wait for effect to run and navigate to be called
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
