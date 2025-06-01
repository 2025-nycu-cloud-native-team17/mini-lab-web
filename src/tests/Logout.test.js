// src/tests/Logout.test.js

import React from "react";
import { render, fireEvent } from "@testing-library/react";
import Logout from "../Components/Logout";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

// 模擬 react-router-dom 的 useNavigate
jest.mock("react-router-dom", () => ({
    useNavigate: jest.fn(),
}));

// 模擬 useAuth hook
jest.mock("../contexts/AuthContext", () => ({
    useAuth: jest.fn(),
}));

describe("Logout Component", () => {
    let logoutMock;
    let navigateMock;

    beforeEach(() => {
        jest.clearAllMocks();

        // 設定 logout 和 navigate 的 mock
        logoutMock = jest.fn();
        navigateMock = jest.fn();
        useAuth.mockReturnValue({ logout: logoutMock });
        useNavigate.mockReturnValue(navigateMock);
    });

    test("renders Logout button with correct text and classes", () => {
        const { getByText } = render(<Logout />);

        const button = getByText("Logout");
        expect(button).toBeInTheDocument();
        // 檢查按鈕的 class
        expect(button).toHaveClass(
            "bg-red-500",
            "text-white",
            "w-24",
            "h-12",
            "rounded",
            "shadow",
            "hover:bg-red-600",
            "z-50"
        );
    });

    test("clicking the Logout button calls logout and navigates to /login", () => {
        const { getByText } = render(<Logout />);

        const button = getByText("Logout");
        fireEvent.click(button);

        expect(logoutMock).toHaveBeenCalledTimes(1);
        expect(navigateMock).toHaveBeenCalledWith("/login");
    });
});
