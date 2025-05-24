import React, { createContext, useContext, useState } from "react";

// 建立 Context
const AuthContext = createContext();

const hostName = process.env.REACT_APP_API_BASE_URL || "/api/v1"

export const AuthProvider = ({ children }) => {
    const [accessToken, setAccessToken] = useState("");

    // ✅ 登入方法
    const login = async (email, password) => {
        const response = await fetch(`${hostName}/login`, {
            method: "POST",
            credentials: "include", // 讓瀏覽器自動帶 refreshToken cookie
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err?.message || "Login failed");
        }

        const data = await response.json();
        const token = data?.accessToken;
        if (token) {
            setAccessToken(token); // 存入全域狀態
            console.log("Login success")
        } else {
            throw new Error("No accessToken returned.");
        }
    };

    // ✅ 登出方法
    const logout = async () => {
        await fetch(`${hostName}/logout`, {
            method: "GET",
            credentials: "include", // refreshToken 存在 HttpOnly cookie 中
        });
        setAccessToken("");
    };
    // ⭐ 新增 refresh 方法
    const refresh = async () => {
        const response = await fetch(`${hostName}/refresh`, {
            method: "GET",
            credentials: "include", // 必須帶 cookie
        });

        if (!response.ok) {
            throw new Error("Refresh token expired");
        }

        const data = await response.json();
        if (data?.accessToken) {
            setAccessToken(data.accessToken);
            return data.accessToken;
        } else {
            throw new Error("No new accessToken received");
        }
    };


    return (
        <AuthContext.Provider value={{ accessToken, login, logout, refresh }}>
            {children}
        </AuthContext.Provider>
    );
};

// ✅ 客製 Hook
export const useAuth = () => useContext(AuthContext);
