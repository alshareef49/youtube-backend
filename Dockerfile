# Use an official Node.js image
FROM node:23-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8000

CMD ["node", "src/index.js"]
