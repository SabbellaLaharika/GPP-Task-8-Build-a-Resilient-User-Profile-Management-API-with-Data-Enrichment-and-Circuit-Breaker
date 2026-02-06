FROM alpine:3.18
WORKDIR /app
RUN apk add --no-cache nodejs npm curl
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8081
CMD ["node", "server.js"]
