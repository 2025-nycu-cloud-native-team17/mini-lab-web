## ✅ 一、AuthContext 的核心原理

React 的 Context API 是一種在 **元件樹中全域共享狀態**的方式。`AuthContext` 就是把「登入狀態（如 accessToken、使用者資訊）」這種全域狀態放進 Context 中，讓任何子元件都可以直接存取或更新。

---

## 🔄 二、登入狀態如何被管理

### 登入流程的運作邏輯：

```
1. 使用者輸入帳號密碼按下登入
↓
2. 前端呼叫 /v1/login API
↓
3. 後端回傳：
   - accessToken → 前端用於身份驗證
   - refreshToken（存在 HttpOnly cookie）→ 瀏覽器自動儲存
↓
4. accessToken 被存進 AuthContext 中
↓
5. 所有需要使用 accessToken 的元件都從 AuthContext 拿 token
↓
6. 之後的 API 請求都在 header 加上 Authorization: Bearer {accessToken}
```

---

## 🧠 三、為什麼不用 localStorage 存 accessToken？

| 儲存方式 | 安全性 | 適合存放 |
|----------|--------|-----------|
| `AuthContext` / `React state` | ✅ 安全（不寫死、不暴露） | `accessToken`（短期） |
| `localStorage` / `sessionStorage` | ❌ 容易被 XSS 竊取 | 不建議存 token |
| Cookie (HttpOnly) | ✅ 安全（無法被 JS 存取） | `refreshToken`（長期） |

➡️ 所以我們選擇：
- accessToken 放在 React Context 中（記憶體內，不被 XSS 讀到）
- refreshToken 放在 HttpOnly Cookie，由瀏覽器自動管理

---

## 🔁 四、Context 的作用是什麼？

Context 本質上是一個：

> 「資料倉庫 + 訂閱機制」

當你把 `accessToken` 放進 Context：
- 任何呼叫 `useAuth()` 的元件都會「訂閱」這個值
- 當 `setAccessToken()` 被呼叫，所有訂閱的元件都會重新 render，拿到最新的 token

---

## ✅ 五、Context 模式的優點

| 優點 | 說明 |
|------|------|
| 全域共享 | 所有頁面都能用同一份 accessToken |
| 集中管理 | login/logout/refresh 都集中管理 |
| 安全性高 | token 不存在 localStorage、cookie，避免 XSS 風險 |
| 易於擴充 | 可加入使用者角色、權限檢查、自動 refresh 等功能 |

---

## 🔐 最佳實踐架構

```jsx
<AuthProvider>
  <App />       ← 所有 Route、頁面都能使用 useAuth()
</AuthProvider>
```

你只要在最外層包一次，裡面任何元件都可以：

```js
const { accessToken, login, logout } = useAuth();
```

---

需要我幫你畫一張流程圖或實作 accessToken 自動刷新嗎？這樣就能做到「長時間登入不中斷」的體驗。
## How to access token
```js
import { useAuth } from "../contexts/AuthContext";

const ProtectedPage = () => {
  const { accessToken } = useAuth();

  useEffect(() => {
    fetch("/v1/users", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }, []);
};
```