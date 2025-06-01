// src/tests/AuthContext.test.js

import React from "react";
import { render, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "../contexts/AuthContext"; // 請根據實際路徑調整

// A helper component to consume the AuthContext and expose its values for testing
let _accessToken;
let _login;
let _logout;
let _refresh;
function TestComponent() {
    const auth = useAuth();
    _accessToken = auth.accessToken;
    _login = auth.login;
    _logout = auth.logout;
    _refresh = auth.refresh;
    return null;
}

describe("AuthProvider / useAuth hook", () => {
    beforeEach(() => {
        // 每次測試前重置 fetch 為 mock
        global.fetch = jest.fn();
        // 清空變數
        _accessToken = undefined;
        _login = undefined;
        _logout = undefined;
        _refresh = undefined;
    });

    test("initial accessToken should be an empty string", () => {
        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );
        expect(_accessToken).toBe("");
    });

    describe("login()", () => {
        test("successful login sets accessToken and calls correct fetch", async () => {
            // Arrange: mock 一個成功的 response
            const fakeToken = "fake-token-123";
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ accessToken: fakeToken }),
            });

            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );

            // Act: 在 act 裡呼叫 login
            await act(async () => {
                await _login("user@example.com", "password123");
            });

            // Assert: accessToken 更新
            expect(_accessToken).toBe(fakeToken);

            // Assert: fetch 被正確呼叫
            expect(global.fetch).toHaveBeenCalledWith("/api/v1/login", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: "user@example.com",
                    password: "password123",
                }),
            });
        });

        test("login throws error when response.ok is false", async () => {
            // Arrange: mock 一個 401-like response
            global.fetch.mockResolvedValueOnce({
                ok: false,
                json: async () => ({ message: "Invalid credentials" }),
            });

            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );

            // Act & Assert: login 要拋出錯誤
            await act(async () => {
                await expect(
                    _login("invalid@example.com", "wrongpass")
                ).rejects.toThrow("Invalid credentials");
            });
        });

        test("login throws error when no accessToken returned", async () => {
            // Arrange: mock 一個成功但 body 裡沒有 accessToken
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({}),
            });

            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );

            // Act & Assert: login 要拋出 "No accessToken returned."
            await act(async () => {
                await expect(
                    _login("user@no-token.com", "password123")
                ).rejects.toThrow("No accessToken returned.");
            });
        });
    });

    describe("logout()", () => {
        test("logout clears the accessToken and calls correct fetch", async () => {
            // 先登入以設置非空的 accessToken
            const initialToken = "initial-token";
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ accessToken: initialToken }),
            });

            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );
            await act(async () => {
                await _login("user@domain.com", "pass123");
            });
            expect(_accessToken).toBe(initialToken);

            // Arrange for logout: mock fetch（logout 不檢查 response.ok）
            global.fetch.mockResolvedValueOnce({});

            // Act: 呼叫 logout
            await act(async () => {
                await _logout();
            });

            // Assert: accessToken 重置為空字串
            expect(_accessToken).toBe("");

            // Assert: fetch 呼叫的參數
            expect(global.fetch).toHaveBeenCalledWith("/api/v1/logout", {
                method: "GET",
                credentials: "include",
            });
        });
    });

    describe("refresh()", () => {
        test("successful refresh returns and sets new accessToken", async () => {
            // Arrange: mock 成功的 refresh 回傳
            const newToken = "refreshed-token-456";
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ accessToken: newToken }),
            });

            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );

            // Act: 呼叫 refresh
            let returned;
            await act(async () => {
                returned = await _refresh();
            });

            // Assert: 回傳值和 context 裡的 accessToken 都要是 newToken
            expect(returned).toBe(newToken);
            expect(_accessToken).toBe(newToken);

            // Assert: fetch 呼叫的參數
            expect(global.fetch).toHaveBeenCalledWith("/api/v1/refresh", {
                method: "GET",
                credentials: "include",
            });
        });

        test("refresh throws error when response.ok is false", async () => {
            // Arrange: mock 一個失敗的 response
            global.fetch.mockResolvedValueOnce({ ok: false });

            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );

            // Act & Assert: refresh 要拋出 "Refresh token expired"
            await act(async () => {
                await expect(_refresh()).rejects.toThrow("Refresh token expired");
            });
        });

        test("refresh throws error when no new accessToken in response", async () => {
            // Arrange: mock 成功回傳但 body 裡沒有 accessToken
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({}),
            });

            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );

            // Act & Assert: refresh 要拋出 "No new accessToken received"
            await act(async () => {
                await expect(_refresh()).rejects.toThrow(
                    "No new accessToken received"
                );
            });
        });
    });
});
