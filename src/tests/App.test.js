// src/tests/App.test.js

import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../App";

// Mock each page component to render a unique test identifier
jest.mock("../pages/Login", () => () => <div data-testid="login-page">LoginPage</div>);
jest.mock("../pages/MemberManagement", () => () => <div data-testid="member-page">MemberManagement</div>);
jest.mock("../pages/MachineManagement", () => () => <div data-testid="machine-page">MachineManagement</div>);
jest.mock("../pages/TaskManagement", () => () => <div data-testid="task-page">TaskManagement</div>);
jest.mock("../pages/Modification", () => () => <div data-testid="modification-page">Modification</div>);
jest.mock("../pages/PersonalProfile", () => () => <div data-testid="profile-page">PersonalProfile</div>);

describe("App routing", () => {
    test("renders LoginPage at `/`", () => {
        render(
            <MemoryRouter initialEntries={["/"]}>
                <App />
            </MemoryRouter>
        );
        expect(screen.getByTestId("login-page")).toBeInTheDocument();
    });

    test("renders LoginPage at `/login`", () => {
        render(
            <MemoryRouter initialEntries={["/login"]}>
                <App />
            </MemoryRouter>
        );
        expect(screen.getByTestId("login-page")).toBeInTheDocument();
    });

    test("renders MemberManagement at `/member`", () => {
        render(
            <MemoryRouter initialEntries={["/member"]}>
                <App />
            </MemoryRouter>
        );
        expect(screen.getByTestId("member-page")).toBeInTheDocument();
    });

    test("renders MachineManagement at `/machine`", () => {
        render(
            <MemoryRouter initialEntries={["/machine"]}>
                <App />
            </MemoryRouter>
        );
        expect(screen.getByTestId("machine-page")).toBeInTheDocument();
    });

    test("renders TaskManagement at `/task`", () => {
        render(
            <MemoryRouter initialEntries={["/task"]}>
                <App />
            </MemoryRouter>
        );
        expect(screen.getByTestId("task-page")).toBeInTheDocument();
    });

    test("renders Modification at `/:dataType/:id` route", () => {
        render(
            <MemoryRouter initialEntries={["/user/123"]}>
                <App />
            </MemoryRouter>
        );
        expect(screen.getByTestId("modification-page")).toBeInTheDocument();
    });

    test("renders PersonalProfile at `/profile`", () => {
        render(
            <MemoryRouter initialEntries={["/profile"]}>
                <App />
            </MemoryRouter>
        );
        expect(screen.getByTestId("profile-page")).toBeInTheDocument();
    });
});
