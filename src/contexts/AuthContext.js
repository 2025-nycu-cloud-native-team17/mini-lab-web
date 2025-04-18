import React, { createContext, useContext, useState } from "react";

// 建立 Context
const AuthContext = createContext();

// 提供者元件
export const AuthProvider = ({ children }) => {
    const [accessToken, setAccessToken] = useState("");

    return (
        <AuthContext.Provider value={{ accessToken, setAccessToken }}>
            {children}
        </AuthContext.Provider>
    );
};

// 客製 hook 讓使用者方便取得 context
export const useAuth = () => useContext(AuthContext);
