// src/tests/useApi.test.js

import React from "react";
import { render, act } from "@testing-library/react";
import { useApi } from "../utils/api";
import { useAuth } from "../contexts/AuthContext";

// 將 useAuth stub 成 jest mock function
jest.mock("../contexts/AuthContext");

let _authFetch;
function TestComponent() {
    const { authFetch } = useApi();
    _authFetch = authFetch;
    return null;
}

describe("useApi hook", () => {
    let mockRefresh;
    let mockLogout;

    beforeEach(() => {
        // 每次測試前，重設 useAuth 回傳值與 fetch mock
        mockRefresh = jest.fn();
        mockLogout = jest.fn();
        useAuth.mockReturnValue({
            accessToken: "initial-token",
            refresh: mockRefresh,
            logout: mockLogout,
        });
        global.fetch = jest.fn();
        _authFetch = undefined;
    });

    test("成功呼叫一次 fetch（status !== 403），並回傳 response，不會呼叫 refresh 或 logout", async () => {
        // Arrange: mock 一個 status 200 的 response
        const fakeResponse = { status: 200, json: async () => ({ data: "ok" }) };
        global.fetch.mockResolvedValueOnce(fakeResponse);

        render(<TestComponent />);

        // Act: 呼叫 authFetch
        let returned;
        await act(async () => {
            returned = await _authFetch("users/123");
        });

        // Assert: authFetch 回傳原始 response
        expect(returned).toBe(fakeResponse);

        // fetch 應該只被呼叫一次
        expect(global.fetch).toHaveBeenCalledTimes(1);
        // 檢查 fetch 呼叫的 URL 與 headers
        expect(global.fetch).toHaveBeenCalledWith("/api/v1/users/123", {
            headers: {
                Authorization: `Bearer initial-token`,
                "Content-Type": "application/json",
            },
        });

        // 不該呼叫 refresh 或 logout
        expect(mockRefresh).not.toHaveBeenCalled();
        expect(mockLogout).not.toHaveBeenCalled();
    });

    test("當第一次 fetch 回傳 status 403 時，會呼叫 refresh，再用新 token retry，最後回傳 retry 的 response", async () => {
        // Arrange: 第一次 fetch 返回 status 403，第二次 fetch 返回 200
        const resp403 = { status: 403 };
        const resp200 = { status: 200, json: async () => ({ ok: true }) };
        global.fetch
            .mockResolvedValueOnce(resp403) // 第一次
            .mockResolvedValueOnce(resp200); // retry

        // mock refresh 回傳新的 token
        mockRefresh.mockResolvedValueOnce("new-token-456");

        render(<TestComponent />);

        // Act: 呼叫 authFetch
        let returned;
        await act(async () => {
            returned = await _authFetch("profile");
        });

        // Assert: 最終回傳 retry 的 response
        expect(returned).toBe(resp200);

        // fetch 應該被呼叫兩次
        expect(global.fetch).toHaveBeenCalledTimes(2);

        // 第一次 fetch 帶初始 token
        expect(global.fetch.mock.calls[0][0]).toBe("/api/v1/profile");
        expect(global.fetch.mock.calls[0][1]).toEqual({
            headers: {
                Authorization: `Bearer initial-token`,
                "Content-Type": "application/json",
            },
        });

        // 確認有呼叫 refresh
        expect(mockRefresh).toHaveBeenCalledTimes(1);

        // 第二次 retry fetch 帶新的 token
        expect(global.fetch.mock.calls[1][0]).toBe("/api/v1/profile");
        expect(global.fetch.mock.calls[1][1]).toEqual({
            headers: {
                Authorization: `Bearer new-token-456`,
                "Content-Type": "application/json",
            },
        });

        // 不該呼叫 logout
        expect(mockLogout).not.toHaveBeenCalled();
    });

    test("傳入 options.headers 時，應該與 Authorization 和 Content-Type 合併", async () => {
        // Arrange: mock 一個 status 200 的 response
        const fakeResponse = { status: 200 };
        global.fetch.mockResolvedValueOnce(fakeResponse);

        render(<TestComponent />);

        // Act: 呼叫 authFetch，並帶入自訂 header
        await act(async () => {
            await _authFetch("data", {
                headers: { "X-Test-Header": "abc123" },
            });
        });

        // Assert: 確認 fetch 呼叫時 headers 包含三組欄位
        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledWith("/api/v1/data", {
            headers: {
                "X-Test-Header": "abc123",
                Authorization: `Bearer initial-token`,
                "Content-Type": "application/json",
            },
        });

        // 不該呼叫 refresh 或 logout
        expect(mockRefresh).not.toHaveBeenCalled();
        expect(mockLogout).not.toHaveBeenCalled();
    });

    test("當第一次 fetch 拋出例外時，catch 會呼叫 logout 並重新拋出錯誤", async () => {
        // Arrange: mock fetch 拋錯
        const networkError = new Error("Network failure");
        global.fetch.mockRejectedValueOnce(networkError);

        render(<TestComponent />);

        // Act & Assert: authFetch 應該 reject，並且呼叫 logout
        await act(async () => {
            await expect(_authFetch("anything")).rejects.toThrow("Network failure");
        });
        expect(mockLogout).toHaveBeenCalledTimes(1);
    });

    test("第一次 fetch 回傳 403，但 refresh 本身拋錯，最後 catch 會呼叫 logout 並重新拋出", async () => {
        // Arrange: 第一次 fetch 回傳 status 403
        const resp403 = { status: 403 };
        global.fetch.mockResolvedValueOnce(resp403);
        // mock refresh 拋錯
        mockRefresh.mockRejectedValueOnce(new Error("Refresh failed"));

        render(<TestComponent />);

        // Act & Assert: authFetch 應該 reject 並呼叫 logout
        await act(async () => {
            await expect(_authFetch("protected")).rejects.toThrow("Refresh failed");
        });

        // 確認 refresh 有被呼叫，且 logout 也被呼叫
        expect(mockRefresh).toHaveBeenCalledTimes(1);
        expect(mockLogout).toHaveBeenCalledTimes(1);

        // 因為 retry fetch 不會被執行（refresh 提早拋錯），fetch 不會有第二次呼叫
        expect(global.fetch).toHaveBeenCalledTimes(1);
    });
});
