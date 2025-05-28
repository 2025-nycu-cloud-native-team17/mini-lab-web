import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost';

// docker run --rm --network host -i grafana/k6 run --env BASE_URL=http://localhost:8888 - < k6/script.js

export const options = {
    vus: 10000,
    duration: '5s',
    thresholds: {
      http_req_duration: ['p(95)<300'], 
      http_req_failed: ['rate<0.01']
    }
};

export default function () {

    let loginHeader = { 'Content-Type': 'application/json' };
    let loginBody = JSON.stringify({ email: 'user1@example.com', password: 'user1' });
    let loginRes = http.post(`${BASE_URL}/api/v1/login`, loginBody, { headers: loginHeader });
    check(loginRes, { 'login ok': (r) => r.status === 200 });
    let token = loginRes.json('accessToken');

    let pool = [1, 2, 3, 4, 5];
    pool.sort(() => Math.random() - 0.5);
    let choice = pool[0];    

    let followingHeaders = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`};
    if (choice === 1) {
        let res = http.get(`${BASE_URL}/api/v1/users`, { headers: followingHeaders });
        check(res, { 'get users': (r) => r.status === 200 });
    } else if (choice === 2) {
        let res = http.get(`${BASE_URL}/api/v1/machines`, { headers: followingHeaders });
        check(res, { 'get machines': (r) => r.status === 200 });
    } else if (choice === 3) {
        let res = http.get(`${BASE_URL}/api/v1/tasks`, { headers: followingHeaders });
        check(res, { 'get tasks': (r) => r.status === 200 });
    } else if (choice === 4) {
        let res = http.get(`${BASE_URL}/api/v1/assignments`, { headers: followingHeaders });
        check(res, { 'get assignments': (r) => r.status === 200 });    } 
    else {
        let res = http.get(`${BASE_URL}/api/v1/assignments/schedule`, { headers: followingHeaders });
        check(res, { 'get schedule': (r) => r.status === 200 });
    }

    sleep(1);
}

