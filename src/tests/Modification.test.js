// src/tests/Modification.test.js

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Modification, {
    formatDate,
} from "../pages/Modification"; // 確認 Modification.js 已把 formatDate export 出來
import { useParams } from "react-router-dom";
import { useApi } from "../utils/api";

// Mock Header 只 render 一個簡單標記
jest.mock("../Components/Header.js", () => () => <div data-testid="header">Header</div>);

// Mock useParams 回傳 dataType 及 id
jest.mock("react-router-dom", () => ({
    useParams: jest.fn(),
}));

// Mock useApi 回傳 authFetch
jest.mock("../utils/api", () => ({
    useApi: jest.fn(),
}));

describe("Utility function formatDate", () => {
    test("returns empty string on falsy input", () => {
        expect(formatDate("")).toBe("");
        expect(formatDate(null)).toBe("");
        expect(formatDate(undefined)).toBe("");
    });

    test("formats ISO string to locale string", () => {
        const iso = "2021-01-02T15:30:00.000Z";
        const expected = new Date(iso).toLocaleString();
        expect(formatDate(iso)).toBe(expected);
    });
});

describe("Modification Component", () => {
    let authFetchMock;
    let alertSpy;
    let consoleErrorSpy;

    const sampleUser = {
        id: "user123",
        name: "Alice",
        earliest_start: 1609502400, // Jan 1 2021 12:00 UTC
        deadline: 1609588800,       // Jan 2 2021 12:00 UTC
        busywindow: [
            [1609502400, 1609506000], // Jan 1 2021 12:00~13:00 UTC
            [1609588800, 1609592400], // Jan 2 2021 12:00~13:00 UTC
        ],
        createdAt: "2021-01-01T00:00:00.000Z",
        updatedAt: "2021-01-03T00:00:00.000Z",
        __v: 0,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        alertSpy = jest.spyOn(window, "alert").mockImplementation(() => { });
        consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => { });
        authFetchMock = jest.fn();
        useApi.mockReturnValue({ authFetch: authFetchMock });
        useParams.mockReturnValue({ dataType: "user", id: "user123" });
    });

    afterEach(() => {
        alertSpy.mockRestore();
        consoleErrorSpy.mockRestore();
    });

    test("renders loading state when formData is null", () => {
        // authFetch 永遠不回應
        authFetchMock.mockReturnValue(new Promise(() => { }));
        render(<Modification />);
        expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    test("fetches data and displays fields correctly", async () => {
        // 設定 authFetch 回傳 sampleUser
        authFetchMock.mockResolvedValueOnce({
            ok: true,
            json: async () => sampleUser,
        });

        render(<Modification />);

        // 等待 fetchData 完成後，確認畫面上 label 及對應的值都出現
        await waitFor(() => {
            expect(screen.getByText("id")).toBeInTheDocument();
            expect(screen.getByText("name")).toBeInTheDocument();
            expect(screen.getByText("earliest_start")).toBeInTheDocument();
            expect(screen.getByText("deadline")).toBeInTheDocument();
            expect(screen.getByText("busywindow")).toBeInTheDocument();
        });

        // 對應的值也要出現在畫面上
        expect(screen.getByText("user123")).toBeInTheDocument();
        expect(screen.getByText("Alice")).toBeInTheDocument();

        // 檢查 earliest_start 顯示為本地可讀格式
        const expectedEarliest = new Date(sampleUser.earliest_start * 1000);
        const pad = (n) => String(n).padStart(2, "0");
        const manualEarliest = `${expectedEarliest.getFullYear()}-${pad(
            expectedEarliest.getMonth() + 1
        )}-${pad(expectedEarliest.getDate())} ${pad(
            expectedEarliest.getHours()
        )}:${pad(expectedEarliest.getMinutes())}`;
        expect(screen.getByText(manualEarliest)).toBeInTheDocument();

        // 檢查 deadline 顯示
        const expectedDeadline = new Date(sampleUser.deadline * 1000);
        const manualDeadline = `${expectedDeadline.getFullYear()}-${pad(
            expectedDeadline.getMonth() + 1
        )}-${pad(expectedDeadline.getDate())} ${pad(
            expectedDeadline.getHours()
        )}:${pad(expectedDeadline.getMinutes())}`;
        expect(screen.getByText(manualDeadline)).toBeInTheDocument();

        // 檢查 busywindow（包含兩個 range），用 includes() 斷言
        const ranges = sampleUser.busywindow.map(([s, e]) => {
            const ds = new Date(s * 1000),
                de = new Date(e * 1000);
            const fmt = (date) =>
                `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
                    date.getDate()
                )} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
            return `${fmt(ds)} ~ ${fmt(de)}`;
        });
        // 因為 <p> 內會換行，所以直接比對 substring
        expect(
            screen.getByText((content) => content.includes(ranges[0]))
        ).toBeInTheDocument();
        expect(
            screen.getByText((content) => content.includes(ranges[1]))
        ).toBeInTheDocument();

        // 最後更新時間 Last Update 也要出現（因為呈現可能有換行，改用 includes）
        const updatedLocale = new Date(sampleUser.updatedAt).toLocaleString();
        expect(
            screen.getByText((content) => content.includes(updatedLocale))
        ).toBeInTheDocument();
    });

    test("toggle to edit mode and update a datetime field then save", async () => {
        authFetchMock
            // 第一次 fetchData
            .mockResolvedValueOnce({
                ok: true,
                json: async () => sampleUser,
            })
            // 第二次 handleSave (PUT)
            .mockResolvedValueOnce({ ok: true })
            // 第三次 fetchData
            .mockResolvedValueOnce({
                ok: true,
                json: async () => sampleUser,
            });

        render(<Modification />);

        // 等待 data 載入完成
        await waitFor(() => {
            expect(screen.getByText("Alice")).toBeInTheDocument();
        });

        // 點擊編輯圖示 (alt="edit") 切換到編輯模式
        fireEvent.click(screen.getByAltText("edit"));

        // name 變成 <input>
        const nameInput = screen.getByDisplayValue("Alice");
        expect(nameInput.tagName).toBe("INPUT");

        // earliest_start 應該是 datetime-local 的 input
        const dtInput = screen.getAllByDisplayValue((val) =>
            val.startsWith("2021-01-01T")
        )[0];
        expect(dtInput).toBeInTheDocument();

        // 模擬修改 earliest_start 為 2021-01-01T13:30
        const newVal = "2021-01-01T13:30";
        fireEvent.change(dtInput, { target: { value: newVal } });

        // 點擊儲存圖示 (alt="save")
        fireEvent.click(screen.getByAltText("save"));

        // 等待 PUT 送出，確認 authFetch 被呼叫且 body 有新 timestamp
        await waitFor(() => {
            expect(authFetchMock).toHaveBeenCalledWith("user/user123", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: expect.stringContaining(
                    `"earliest_start":${Math.floor(new Date(newVal).getTime() / 1000)}`
                ),
            });
        });

        // PUT 成功後會再 fetchData (GET user/user123)
        expect(authFetchMock).toHaveBeenCalledWith("user/user123");

        // 結束編輯模式後，圖示應該回到 edit
        expect(screen.getByAltText("edit")).toBeInTheDocument();
    });

    test("fetchData handles list branch and missing item", async () => {
        // 如果 dataType="tasks"（非 'user' 分支）
        useParams.mockReturnValue({ dataType: "tasks", id: "nonexistent" });
        // authFetch 回傳列表，但找不到 id
        authFetchMock.mockResolvedValueOnce({
            ok: true,
            json: async () => [{ id: "other", foo: "bar" }],
        });

        render(<Modification />);

        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                "Fetch failed",
                expect.any(Error)
            );
            expect(alertSpy).toHaveBeenCalledWith("讀取資料失敗，請稍後再試");
        });
    });

    test("handleSave shows alert on PUT failure", async () => {
        // 初次 fetchData 成功
        authFetchMock.mockResolvedValueOnce({
            ok: true,
            json: async () => sampleUser,
        });
        // handleSave 時 PUT 失敗
        authFetchMock.mockResolvedValueOnce({ ok: false, status: 500 });

        render(<Modification />);

        await waitFor(() => {
            expect(screen.getByText("Alice")).toBeInTheDocument();
        });

        // 切到編輯模式後立即儲存
        fireEvent.click(screen.getByAltText("edit"));
        fireEvent.click(screen.getByAltText("save"));

        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                "Update failed",
                expect.any(Error)
            );
            expect(alertSpy).toHaveBeenCalledWith("更新失敗，請稍後再試");
        });
    });
});
