FROM node:20-bookworm-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV VITE_API_BASE_URL=/api

EXPOSE 5173

CMD ["npm", "run", "dev"]
