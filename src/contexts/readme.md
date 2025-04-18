How to access token
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