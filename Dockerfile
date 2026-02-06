# Stage 1: Build application and install dependencies
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Stage 2: Create a minimal production image
FROM alpine:3.18
WORKDIR /app
# Install Node.js, npm, and curl (for healthcheck) manually for smaller size
RUN apk add --no-cache nodejs npm curl



# Copy package manifest and install production dependencies
COPY --from=builder /app/package*.json ./
RUN npm install

COPY --from=builder /app/src ./src
COPY --from=builder /app/tests ./tests
COPY --from=builder /app/openapi.yaml ./
EXPOSE 8080
CMD ["node", "src/app.js"]
