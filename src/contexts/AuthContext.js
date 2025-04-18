import React, { createContext, useContext, useState } from "react";

// 建立 Context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [accessToken, setAccessToken] = useState("");

    // ✅ 登入方法
    const login = async (email, password) => {
        const response = await fetch("http://localhost:8888/api/v1/login", {
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
        await fetch("http://localhost:8888/api/v1/logout", {
            method: "GET",
            credentials: "include", // refreshToken 存在 HttpOnly cookie 中
        });
        setAccessToken("");
    };

    return (
        <AuthContext.Provider value={{ accessToken, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// ✅ 客製 Hook
export const useAuth = () => useContext(AuthContext);
