// src/api.js
import { useAuth } from '../contexts/AuthContext';

export const useApi = () => {
    const { accessToken, refresh, logout } = useAuth();
    const hostName = "http://localhost:8888/api/v1"

    const authFetch = async (url, options = {}) => {
        try {
            const res = await fetch(`${hostName}/${url}`, {
                ...options,
                headers: {
                    ...(options.headers || {}),
                    "Authorization": `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            });

            if (res.status !== 403) {
                return res;
            }

            console.warn("Access token expired, trying refresh...");
            const newAccessToken = await refresh();

            const retryRes = await fetch(`${hostName}/${url}`, {
                ...options,
                headers: {
                    ...(options.headers || {}),
                    "Authorization": `Bearer ${newAccessToken}`,
                    "Content-Type": "application/json",
                },
            });

            return retryRes;

        } catch (err) {
            console.error("authFetch error:", err);
            await logout();
            throw err;
        }
    };

    return { authFetch };
};
