FROM node:18-alpine
WORKDIR /app
RUN apk --no-cache add curl
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8081
CMD ["node", "server.js"]
