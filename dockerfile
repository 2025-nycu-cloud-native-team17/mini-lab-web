# for dev only
# 使用 Node.js 作為 base image
FROM node:20

# 建立 app 資料夾
WORKDIR /app

# 複製 package 檔案以安裝依賴
COPY package.json package-lock.json ./

# 安裝依賴（npm 或 yarn）
RUN npm install

# 複製專案原始碼（你也可以選擇只在 volume 掛載時跳過）
COPY . .

# 開放 React 預設開發 port
EXPOSE 3000

# 啟動 React 開發伺服器（使用 host 模式允許 HMR）
CMD ["npm", "start"]
