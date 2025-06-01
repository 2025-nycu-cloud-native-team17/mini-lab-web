// src/tests/ListPanel.test.js

import React from "react";
import { render, fireEvent, act } from "@testing-library/react";
import ListPanel from "../Components/ListPanel";
import { useNavigate } from "react-router-dom";
import { useApi } from "../utils/api";

// 模擬 react-router-dom 的 useNavigate
jest.mock("react-router-dom", () => ({
    useNavigate: jest.fn(),
}));

// 模擬 useApi hook
jest.mock("../utils/api", () => ({
    useApi: jest.fn(),
}));

// 模擬 Modal，只要 isOpen 為 true，就 render children；否則不 render
jest.mock("../Components/Modal", () => {
    return function MockModal({ isOpen, children }) {
        return isOpen ? <div data-testid="modal">{children}</div> : null;
    };
});

describe("ListPanel Component", () => {
    let navigateMock;
    let authFetchMock;
    let refreshMock;
    let consoleErrorSpy;
    let consoleWarnSpy;

    // 預設 props
    const baseProps = {
        title: "Items",
        columns: ["ID", "Name", "Value"],
        data: [
            ["1", "Foo", "100"],
            ["2", "Bar", "200"],
        ],
        dataType: "items",
        attributes: ["name", "value"],
        refresh: jest.fn(),
    };

    beforeEach(() => {
        // 重設所有 mock
        jest.clearAllMocks();

        // 設定 navigateMock
        navigateMock = jest.fn();
        useNavigate.mockReturnValue(navigateMock);

        // 設定 authFetchMock 和 refreshMock
        authFetchMock = jest.fn();
        refreshMock = jest.fn();
        useApi.mockReturnValue({
            authFetch: authFetchMock,
        });

        // Spy console.error 和 console.warn
        consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => { });
        consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation(() => { });
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
        consoleWarnSpy.mockRestore();
    });

    test("renders title, columns, and rows correctly; edit toggles to save", () => {
        const { getByText, queryByAltText } = render(<ListPanel {...baseProps} />);

        // 標題與表頭正確顯示
        expect(getByText("Items")).toBeInTheDocument();
        expect(getByText("ID")).toBeInTheDocument();
        expect(getByText("Name")).toBeInTheDocument();
        expect(getByText("Value")).toBeInTheDocument();

        // rows 值正確顯示
        expect(getByText("Foo")).toBeInTheDocument();
        expect(getByText("Bar")).toBeInTheDocument();

        // 初始 isEditing = false，應顯示 edit 圖示 (alt="edit")
        const editIcon = queryByAltText("edit");
        expect(editIcon).toBeInTheDocument();

        // 點擊 edit 圖示後，isEditing 變 true，會顯示 save 圖示
        fireEvent.click(editIcon);
        const saveIcon = queryByAltText("save");
        expect(saveIcon).toBeInTheDocument();

        // 再次點擊 save，應還原為 edit
        fireEvent.click(saveIcon);
        expect(queryByAltText("edit")).toBeInTheDocument();
    });

    test("clicking row when not editing invokes navigate with correct path", () => {
        const { getByText } = render(<ListPanel {...baseProps} />);

        // isEditing = false，點擊包含 "Foo" 的列
        fireEvent.click(getByText("Foo"));
        expect(navigateMock).toHaveBeenCalledWith("/items/1");

        // 點擊包含 "Bar" 的列
        fireEvent.click(getByText("Bar"));
        expect(navigateMock).toHaveBeenCalledWith("/items/2");
    });

    test("clicking row when editing does not invoke navigate", () => {
        const { queryByAltText, getByText } = render(<ListPanel {...baseProps} />);

        // 切換到編輯模式
        const editIcon = queryByAltText("edit");
        fireEvent.click(editIcon);

        // isEditing = true，點擊列時不應該呼叫 navigate
        fireEvent.click(getByText("Foo"));
        expect(navigateMock).not.toHaveBeenCalled();
    });

    test("delete icon appears when editing; clicking delete calls authFetch and refresh", async () => {
        const props = {
            ...baseProps,
            data: [["123", "Baz", "300"]],
        };
        // mock authFetch 成功
        authFetchMock.mockResolvedValueOnce({ ok: true });
        props.refresh = jest.fn();

        const { queryByAltText, findByAltText } = render(<ListPanel {...props} />);

        // 進入編輯模式
        fireEvent.click(queryByAltText("edit"));
        // 等待 save icon 出現
        expect(await findByAltText("save")).toBeInTheDocument();

        // 此時應該找到 delete icon (alt="delete")
        const deleteIcon = queryByAltText("delete");
        expect(deleteIcon).toBeInTheDocument();

        // 點擊 delete icon，傳 event 停止冒泡
        await act(async () => {
            fireEvent.click(deleteIcon, { stopPropagation: () => { } });
        });

        // authFetch 應被呼叫一次，URL = "items/123"，method = DELETE
        expect(authFetchMock).toHaveBeenCalledWith("items/123", {
            method: "DELETE",
        });

        // props.refresh 應被呼叫
        expect(props.refresh).toHaveBeenCalled();
    });

    test("delete error: authFetch 拋錯時 console.error, refresh 不呼叫", async () => {
        const props = {
            ...baseProps,
            data: [["999", "Err", "0"]],
        };
        // mock authFetch 拋出錯誤
        const errorObj = new Error("Delete failed");
        authFetchMock.mockRejectedValueOnce(errorObj);
        props.refresh = jest.fn();

        const { queryByAltText, findByAltText } = render(<ListPanel {...props} />);

        // 進入編輯模式
        fireEvent.click(queryByAltText("edit"));
        expect(await findByAltText("save")).toBeInTheDocument();

        // 點擊 delete icon
        await act(async () => {
            fireEvent.click(queryByAltText("delete"), { stopPropagation: () => { } });
        });

        // authFetch 被呼叫
        expect(authFetchMock).toHaveBeenCalledWith("items/999", {
            method: "DELETE",
        });

        // props.refresh 不應該被呼叫
        expect(props.refresh).not.toHaveBeenCalled();

        // 應該有 console.error 記錄
        expect(consoleErrorSpy).toHaveBeenCalledWith("刪除失敗：", errorObj);
    });

    test("add icon appears when editing; clicking add opens modal", () => {
        const { queryByAltText, queryByTestId } = render(<ListPanel {...baseProps} />);

        // 初始不顯示 add icon
        expect(queryByAltText("add")).not.toBeInTheDocument();

        // 進入編輯模式
        fireEvent.click(queryByAltText("edit"));
        // 現在應顯示 add icon
        const addIcon = queryByAltText("add");
        expect(addIcon).toBeInTheDocument();

        // 點擊 add icon 後，modal 應開啟 (data-testid="modal")
        fireEvent.click(addIcon);
        expect(queryByTestId("modal")).toBeInTheDocument();
    });

    test("form submission success calls authFetch with correct body and refresh", async () => {
        // 用單一屬性 name, value
        const props = {
            ...baseProps,
            attributes: ["name", "value"],
        };
        props.refresh = jest.fn();
        const okResponse = { ok: true };
        authFetchMock.mockResolvedValueOnce(okResponse);

        const { queryByAltText, getByLabelText, getByText, queryByTestId } =
            render(<ListPanel {...props} />);

        // 進入編輯模式並打開 modal
        fireEvent.click(queryByAltText("edit"));
        fireEvent.click(queryByAltText("add"));
        expect(queryByTestId("modal")).toBeInTheDocument();

        // 填入 name、value
        const nameInput = getByLabelText("name");
        const valueInput = getByLabelText("value");
        fireEvent.change(nameInput, { target: { name: "name", value: "Alice" } });
        fireEvent.change(valueInput, { target: { name: "value", value: "42" } });

        // 提交表單
        await act(async () => {
            fireEvent.submit(getByText("Add").closest("button"));
        });

        // authFetch 應被呼叫一次，url = "items"，method POST，body 包含 JSON 字串
        expect(authFetchMock).toHaveBeenCalledWith("items", {
            method: "POST",
            body: JSON.stringify({ name: "Alice", value: "42" }),
        });

        // props.refresh 應被呼叫
        expect(props.refresh).toHaveBeenCalled();
    });

    test("form submission error: res.ok = false 時 console.error, refresh 不呼叫", async () => {
        const props = {
            ...baseProps,
            attributes: ["name"],
        };
        props.refresh = jest.fn();
        // mock authFetch 回傳 ok = false，json 方法傳回 error 訊息
        authFetchMock.mockResolvedValueOnce({
            ok: false,
            json: async () => ({ message: "Invalid data" }),
        });

        const { queryByAltText, getByLabelText, getByText, queryByTestId } =
            render(<ListPanel {...props} />);

        // 進入編輯模式並打開 modal
        fireEvent.click(queryByAltText("edit"));
        fireEvent.click(queryByAltText("add"));
        expect(queryByTestId("modal")).toBeInTheDocument();

        // 填入 name
        fireEvent.change(getByLabelText("name"), {
            target: { name: "name", value: "Bob" },
        });

        // 提交表單
        await act(async () => {
            fireEvent.submit(getByText("Add").closest("button"));
        });

        // authFetch 應被呼叫
        expect(authFetchMock).toHaveBeenCalledWith("items", {
            method: "POST",
            body: JSON.stringify({ name: "Bob" }),
        });

        // console.error 應被呼叫，參數包含 'Error:' 及 { message: 'Invalid data' }
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            "Error:",
            expect.objectContaining({ message: "Invalid data" })
        );

        // props.refresh 不應該被呼叫
        expect(props.refresh).not.toHaveBeenCalled();
    });

    test("handles multiple select for Members testType correctly on submit", async () => {
        const props = {
            title: "Members",
            columns: ["ID", "Email", "Role"],
            data: [],
            dataType: "members",
            attributes: ["email", "testType"],
            refresh: jest.fn(),
        };
        // 模擬 authFetch 回傳 ok = true
        authFetchMock.mockResolvedValueOnce({ ok: true });

        const { queryByAltText, queryByTestId, getByLabelText, getByText } =
            render(<ListPanel {...props} />);

        // 進入編輯模式並打開 modal
        fireEvent.click(queryByAltText("edit"));
        fireEvent.click(queryByAltText("add"));
        expect(queryByTestId("modal")).toBeInTheDocument();

        // 填入 email
        fireEvent.change(getByLabelText("email"), {
            target: { name: "email", value: "member@example.com" },
        });

        // 模擬選擇多重選項
        const selectNode = getByLabelText("testType");
        // 選擇第一個和第三個 option
        const options = selectNode.querySelectorAll("option");
        options[0].selected = true;
        options[2].selected = true;
        // 觸發 change 事件
        await act(async () => {
            fireEvent.change(selectNode);
        });

        // 提交表單
        await act(async () => {
            fireEvent.submit(getByText("Add").closest("button"));
        });

        // authFetch 應該以 POST 呼叫 "members"，body 中 testType 為 array
        expect(authFetchMock).toHaveBeenCalledWith("members", {
            method: "POST",
            body: JSON.stringify({
                email: "member@example.com",
                testType: ["Thermal Testing", "Physical Property Testing"],
            }),
        });

        // props.refresh 應該被呼叫
        expect(props.refresh).toHaveBeenCalled();
    });
});
