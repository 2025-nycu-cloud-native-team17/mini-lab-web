import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from '../Components/Header.js'
import { useAuth } from "../contexts/AuthContext"; // 路徑依你的實際檔案位置
import { jwtDecode } from "jwt-decode";

const decodeToken = (token) => {
  try {
    const decoded = jwtDecode(token);
    return decoded;
  } catch (error) {
    console.error("Invalid JWT", error);
    return null;
  }
};


const LoginPage = () => {
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const token = await login(email, password);
            const decoded = decodeToken(token);
            console.log(decoded.role)
            if(decoded.role == "member") {
                navigate(`/PersonalInfo/${decoded.id}`)
            } else {
                navigate("/");
            }
        } catch (error) {
            console.error("Login error:", error);
        }
    };


    return (
        <div>
            <Header />
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="bg-[#D9D9D9] p-10 w-full max-w-md border border-gray-400">
                    <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Sign In</h2>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">Account</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-none"
                                placeholder="example@mail.com"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-none"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white font-semibold py-2 border border-blue-700 hover:bg-blue-700 transition duration-300 rounded-none"
                        >
                            Submit
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
