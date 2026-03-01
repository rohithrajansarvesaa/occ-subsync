# Backend Dockerfile — Node 20 Alpine (lightweight & secure)
FROM node:20-alpine

# Create app directory
WORKDIR /app

# Copy dependency manifests and install production deps only
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .

# Non-root user for security
RUN addgroup -S subsync && adduser -S subsync -G subsync
USER subsync

EXPOSE 5000

CMD ["node", "src/index.js"]
