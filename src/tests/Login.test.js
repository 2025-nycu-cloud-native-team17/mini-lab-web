// src/tests/LoginPage.test.js

import React from "react";
import { render, fireEvent, act } from "@testing-library/react";
import LoginPage from "../pages/Login";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Header from "../Components/Header.js";

// Mock react-router-dom useNavigate
jest.mock("react-router-dom", () => ({
    useNavigate: jest.fn(),
}));

// Mock useAuth hook
jest.mock("../contexts/AuthContext", () => ({
    useAuth: jest.fn(),
}));

// Mock Header component
jest.mock("../Components/Header.js", () => () => <div data-testid="header">Header</div>);

describe("LoginPage Component", () => {
    let loginMock;
    let navigateMock;
    let consoleErrorSpy;

    beforeEach(() => {
        jest.clearAllMocks();

        // Create mocks
        loginMock = jest.fn();
        navigateMock = jest.fn();

        // Setup useAuth to return our mock
        useAuth.mockReturnValue({ login: loginMock });

        // Setup useNavigate to return our mock
        useNavigate.mockReturnValue(navigateMock);

        // Spy on console.error
        consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => { });
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    test("renders Header, email & password inputs, and submit button", () => {
        const { getByTestId, getByPlaceholderText, getByText } = render(<LoginPage />);

        // Header should render
        expect(getByTestId("header")).toBeInTheDocument();

        // Email input
        const emailInput = getByPlaceholderText("example@mail.com");
        expect(emailInput).toBeInTheDocument();
        expect(emailInput).toHaveAttribute("type", "email");
        expect(emailInput).toBeRequired();

        // Password input
        const passwordInput = getByPlaceholderText("••••••••");
        expect(passwordInput).toBeInTheDocument();
        expect(passwordInput).toHaveAttribute("type", "password");
        expect(passwordInput).toBeRequired();

        // Submit button
        const submitButton = getByText("Submit");
        expect(submitButton).toBeInTheDocument();
        expect(submitButton).toHaveAttribute("type", "submit");
    });

    test("typing into inputs updates their values", () => {
        const { getByPlaceholderText } = render(<LoginPage />);

        const emailInput = getByPlaceholderText("example@mail.com");
        const passwordInput = getByPlaceholderText("••••••••");

        // Simulate typing
        fireEvent.change(emailInput, { target: { value: "user@test.com" } });
        fireEvent.change(passwordInput, { target: { value: "mypassword" } });

        expect(emailInput).toHaveValue("user@test.com");
        expect(passwordInput).toHaveValue("mypassword");
    });

    test("successful login calls login and navigates to /profile", async () => {
        // Mock login to resolve
        loginMock.mockResolvedValueOnce();

        const { getByPlaceholderText, getByText } = render(<LoginPage />);

        const emailInput = getByPlaceholderText("example@mail.com");
        const passwordInput = getByPlaceholderText("••••••••");
        const submitButton = getByText("Submit");

        // Fill form
        fireEvent.change(emailInput, { target: { value: "success@example.com" } });
        fireEvent.change(passwordInput, { target: { value: "rightpass" } });

        // Submit form
        await act(async () => {
            fireEvent.click(submitButton);
        });

        // login should have been called with correct args
        expect(loginMock).toHaveBeenCalledWith("success@example.com", "rightpass");

        // navigate should be called to /profile
        expect(navigateMock).toHaveBeenCalledWith("/profile");

        // console.error should not have been called
        expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    test("failed login (throw) logs error and does not navigate", async () => {
        const errorObj = new Error("Invalid credentials");
        // Mock login to reject
        loginMock.mockRejectedValueOnce(errorObj);

        const { getByPlaceholderText, getByText } = render(<LoginPage />);

        const emailInput = getByPlaceholderText("example@mail.com");
        const passwordInput = getByPlaceholderText("••••••••");
        const submitButton = getByText("Submit");

        // Fill form
        fireEvent.change(emailInput, { target: { value: "fail@example.com" } });
        fireEvent.change(passwordInput, { target: { value: "wrongpass" } });

        // Submit form
        await act(async () => {
            fireEvent.click(submitButton);
        });

        // login should have been called
        expect(loginMock).toHaveBeenCalledWith("fail@example.com", "wrongpass");

        // navigate should NOT have been called
        expect(navigateMock).not.toHaveBeenCalled();

        // console.error should have been called with prefix "Login error:" and the error object
        expect(consoleErrorSpy).toHaveBeenCalledWith("Login error:", errorObj);
    });
});
