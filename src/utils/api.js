// src/api.js
import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

const hostName = process.env.REACT_APP_API_BASE_URL || "/api/v1"

export const useApi = () => {
    const { accessToken, refresh, logout } = useAuth();

    const authFetch = useCallback(async (url, options = {}) => {
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
    }, [accessToken, refresh, logout]);

    return { authFetch };
};